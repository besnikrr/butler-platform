package main

import (
	"bytes"
	"flag"
	"fmt"
	"os/exec"
	"regexp"
	"strings"
)

/**
MigrateUp command to run migrations
MigrateDown command to rollback the migration - if specified in the file
*/
const (
	MigrateUp   = "migrate-up-serverless"
	MigrateDown = "migrate-down-serverless"
)

func printOutput(stdout, stderr bytes.Buffer) {
	if stdout.String() != "" {
		fmt.Println("stdout:", stdout.String())
	}
	if stderr.String() != "" {
		fmt.Println("stderr:", stderr.String())
	}
}

func build(cmd *exec.Cmd, stdout, stderr bytes.Buffer, verbose bool) func(serviceName string, finish chan map[string]bool) {
	return func(serviceName string, finish chan map[string]bool) {
		cmd = exec.Command("nx", "build", serviceName, "--skip-nx-cache")
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		err := cmd.Run()
		m := make(map[string]bool)
		if err != nil {
			fmt.Printf("[build-error-%s] %s\n----------------\n", serviceName, err.Error())
			m[serviceName] = false
		} else {
			m[serviceName] = true
		}
		if verbose {
			printOutput(stdout, stderr)
		}

		finish <- m
	}
}

func test(cmd *exec.Cmd, stdout, stderr bytes.Buffer, verbose bool) func(serviceName string, finish chan map[string]bool) {
	return func(serviceName string, finish chan map[string]bool) {
		cmd = exec.Command("nx", "test", serviceName, "--skip-nx-cache")
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		err := cmd.Run()
		m := make(map[string]bool)
		if err != nil {
			fmt.Printf("[test-error-%s] %s\n----------------\n", serviceName, err.Error())
			m[serviceName] = false
		} else {
			m[serviceName] = true
		}
		if verbose {
			printOutput(stdout, stderr)
		}
		finish <- m
	}
}

func deploy(cmd *exec.Cmd, stdout, stderr bytes.Buffer, verbose bool) func(serviceName, stage, region string, finish chan map[string]bool) {
	return func(serviceName, stage, region string, finish chan map[string]bool) {
		cmd = exec.Command("nx", "deploy", serviceName, "--stage", stage, "--region", region)
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		err := cmd.Run()
		m := make(map[string]bool)
		if err != nil {
			fmt.Printf("[deploy-error-%s] %s\n----------------\n", serviceName, err.Error())
			m[serviceName] = false
		} else {
			m[serviceName] = true
		}
		if verbose {
			printOutput(stdout, stderr)
		}
		finish <- m
	}
}

func migrate(cmd *exec.Cmd, stdout, stderr bytes.Buffer, verbose bool) func(serviceName, command, stage, region string, finish chan map[string]bool) {
	return func(serviceName, command, stage, region string, finish chan map[string]bool) {
		cmd = exec.Command("nx", command, serviceName, "--stage", stage, "--region", region)
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		err := cmd.Run()
		m := make(map[string]bool)
		if err != nil {
			fmt.Printf("[migrate-up-error-%s] %s\n----------------\n", serviceName, err.Error())
			m[serviceName] = false
		} else {
			m[serviceName] = true
		}
		if verbose {
			printOutput(stdout, stderr)
		}
		finish <- m
	}
}

func sfsp(cmd *exec.Cmd, stdout, stderr bytes.Buffer, verbose bool) func(serviceName, stage, region string, finish chan map[string]bool) {
	return func(serviceName, stage, region string, finish chan map[string]bool) {
		cmd = exec.Command("nx", "sfsp", serviceName, "--stage", stage, "--region", region)
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		err := cmd.Run()
		m := make(map[string]bool)
		if err != nil {
			fmt.Printf("[sfsp-error-%s] %s\n----------------\n", serviceName, err.Error())
			m[serviceName] = false
		} else {
			m[serviceName] = true
		}
		if verbose {
			printOutput(stdout, stderr)
		}
		finish <- m
	}
}

func getAffected(cmd *exec.Cmd, stdout, stderr bytes.Buffer, verbose bool) []string {
	cmd = exec.Command("nx", "affected", "--target", "base-build", "--base", "development", "--skip-nx-cache")
	r, _ := regexp.Compile("service-.*")
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		fmt.Printf("[getAffected-error] %s\n----------------\n", err.Error())
	}
	return r.FindStringSubmatch(stdout.String())
}

func main() {
	var stdout, stderr bytes.Buffer
	cmd := &exec.Cmd{}

	affectedServices := getAffected(cmd, stdout, stderr, true)
	fmt.Println("affected-services: ", affectedServices)

	serviceMatrix := make(map[string]map[string]bool)
	servicesArg := flag.String("services", "", "List of services")
	verboseArg := flag.Bool("verbose", false, "Show output information")
	flag.Parse()
	services := strings.Split(*servicesArg, ",")
	if *servicesArg == "" {
		services = affectedServices
	}

	fmt.Println("Starting build/test for: ", services)
	buildfinish := make(chan map[string]bool)
	testfinish := make(chan map[string]bool)
	deployfinish := make(chan map[string]bool)
	migratefinish := make(chan map[string]bool)
	sfspfinish := make(chan map[string]bool)
	for _, service := range services {
		serviceMatrix[service] = map[string]bool{
			"build":   false,
			"test":    false,
			"deploy":  false,
			"migrate": false,
			"sfsp":    false,
		}
		go build(cmd, stdout, stderr, *verboseArg)(service, buildfinish)
		fmt.Printf("Started build %s\n", service)

		go test(cmd, stdout, stderr, *verboseArg)(service, testfinish)
		fmt.Printf("Started test %s\n", service)
	}

	for range services {
		b, t := <-buildfinish, <-testfinish
		for s := range b {
			serviceMatrix[s]["build"] = b[s]
		}
		for s := range t {
			serviceMatrix[s]["test"] = t[s]
		}
	}

	for _, service := range services {
		if serviceMatrix[service]["build"] && serviceMatrix[service]["test"] {
			go deploy(cmd, stdout, stderr, *verboseArg)(service, "dev", "us-east-1", deployfinish)
			fmt.Printf("Started deploying %s\n", service)
		}
	}

	fmt.Println("After deploy loop")
	for range services {
		d := <-deployfinish
		for s := range d {
			serviceMatrix[s]["deploy"] = d[s]
		}
	}

	fmt.Println("Before migrate loop", services)
	for _, service := range services {
		fmt.Println("some-service: ", service)
		if serviceMatrix[service]["deploy"] {
			fmt.Println("inside migrate exec")
			go migrate(cmd, stdout, stderr, *verboseArg)(service, MigrateUp, "dev", "us-east-1", migratefinish)
			fmt.Printf("Running migrations for: %s\n", service)
		} else {
			fmt.Println("inside else migrate exec", migratefinish)
			go func(ch chan map[string]bool, serviceName string) {
				ch <- map[string]bool{
					serviceName: false,
				}
			}(migratefinish, service)

			fmt.Println("after migratefinish assign: ", migratefinish)
		}
	}

	fmt.Println("Before migrate finish loop")
	for range services {
		m := <-migratefinish
		for s := range m {
			serviceMatrix[s]["migrate"] = m[s]
		}
	}

	fmt.Println("Before sfsp loop")
	for _, service := range services {
		if serviceMatrix[service]["migrate"] {
			go sfsp(cmd, stdout, stderr, *verboseArg)(service, "dev", "us-east-1", sfspfinish)
			fmt.Printf("Running sfsp for: %s\n", service)
		} else {
			go func(ch chan map[string]bool, serviceName string) {
				ch <- map[string]bool{
					serviceName: false,
				}
			}(sfspfinish, service)
		}
	}

	fmt.Println("Before sfsp finish loop")
	for range services {
		m := <-sfspfinish
		for s := range m {
			serviceMatrix[s]["sfsp"] = m[s]
		}
	}

	fmt.Println("--------------------")

	for s := range serviceMatrix {
		fmt.Printf(
			"%s\nbuild: %t\ntest: %t\ndeploy: %t\nmigrate: %t\nsfsp: %t\n----------------\n",
			s, serviceMatrix[s]["build"],
			serviceMatrix[s]["test"],
			serviceMatrix[s]["deploy"],
			serviceMatrix[s]["deploy"],
			serviceMatrix[s]["sfsp"])
	}
}
