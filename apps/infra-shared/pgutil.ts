import { Pool } from 'pg';
// export namespace PG {
export const pool = new Pool({
	user: process.env.POSTGRES_USER,
	host: process.env.POSTGRES_HOST,
	database: 'service_iam',
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
});

export const queryexec = async (input: QueryPGObject) => {
	const start = Date.now()
	try {
		console.log('pool-config: ', pool)
		const res = await pool.query(input)
		const duration = Date.now() - start
		console.log('executed query', { input, duration, rows: res.rowCount })
		return res;
	} catch (e) {
		console.log('exec query error: ', e)
	}

	return { command: '', rows: [], rowCount: 0 }
}

export const getSingle = async (input: QueryPGObject) => {
	const res = await queryexec(input);
	return res.command == 'SELECT' && res.rows && res.rows.length ? res.rows[0] : {}
}

export const insertquery = (
	table: string,
	input: { [key: string]: any } | { [key: string]: any }[],
	onConstraintQuery = ''
) => {
	const params: string[] = [];
	const values: string[] = [];
	const paramvalues: string[] = [];
	const bulk = input.length > 0;

	if (bulk) {
		let i: number = 0;
		let idx: number = 0;
		input.forEach((ob: { [key: string]: any }) => {
			const keys: any[] = []
			Object.keys(ob).forEach((key: string) => {
				if (i === 0) {
					params.push(key);
				}
				values.push(`$${idx + 1}`);
				keys.push(`$${idx + 1}`);
				idx++;
			})
			i++;
			paramvalues.push(`(${keys.toString()})`)
		})
	} else {
		Object.keys(input).forEach((key: string, idx: number) => {
			params.push(key);
			values.push(`$${idx + 1}`);
		})
		paramvalues.push(`(${values})`).toString();
	}

	let inputvals = []
	if (bulk) {
		const collectedValues = input.map((ob: any) => Object.values(ob).map((e: any) => (!e ? null : e)))
		inputvals = [].concat.apply([], collectedValues) //.toString().split(',')
		console.log('bulk-input: ', input)
		console.log('bulk-inputvals: ', inputvals)
	} else {
		inputvals = Object.values(input);
		console.log('input: ', input)
		console.log('inputvals: ', inputvals)
	}

	const txt = `insert into ${table} (${params.toString()}) values ${paramvalues} ${onConstraintQuery} returning *`;
	return {
		text: txt,
		values: inputvals
	}
}

export const insert = async (
	table: string, input: { [key: string]: any } | { [key: string]: any }[], onConstraintQuery = ''
) => {
	const queryinput = insertquery(table, input, onConstraintQuery);
	console.log('queryinput: ', queryinput)
	const output = await queryexec(queryinput);

	console.log('output: ', output)

	if (output && output.rows && output.rows.length) {
		return Array.isArray(input) ? output.rows : output.rows[0]
	}

	throw 'INSERT failure';
}

export const updatequery = (table: string, id: number, input: { [key: string]: any }) => {
	const params: string[] = [];
	Object.keys(input).forEach((key: string, idx: number) => {
		params.push(`${key} = $${idx + 1}`);
	})

	return {
		text: `update ${table} set ${params.toString()} where id = $${Object.keys(input).length + 1} returning *`,
		values: Object.values(input).concat([id.toString()])
	}
}

export const update = async (table: string, id: number, input: { [key: string]: any }) => {
	const queryinput = updatequery(table, id, input)
	const output = await queryexec(queryinput);

	if (output && output.rows && output.rows.length) {
		return output.rows[0]
	}

	throw 'UPDATE failure';
}


export interface QueryPGObject {
	text: string;
	values?: any[];
}
