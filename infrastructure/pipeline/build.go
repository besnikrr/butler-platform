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
	skipTestsArg := flag.Bool("skipTests", false, "Skip tests")
	flag.Parse()
	services := strings.Split(*servicesArg, ",")
	if *servicesArg == "" {
		services = affectedServices
	}

	fmt.Println("Starting build/test for: ", services)
	buildfinish := make(chan map[string]bool)
	testfinish := make(chan map[string]bool)

	for _, service := range services {
		serviceMatrix[service] = map[string]bool{
			"build": false,
			"test":  false,
		}
		go build(cmd, stdout, stderr, *verboseArg)(service, buildfinish)
		if !*skipTestsArg {
			go test(cmd, stdout, stderr, *verboseArg)(service, testfinish)
		}

		fmt.Printf("Start build/test %s\n", service)
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

	for s := range serviceMatrix {
		fmt.Printf("%s\nbuild: %t\ntest: %t\n",
			s, serviceMatrix[s]["build"], serviceMatrix[s]["test"])
	}
}
