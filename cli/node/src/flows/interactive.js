import * as child_process from 'child_process'
import inquirer from 'inquirer'
import nonInteractive from './nonInteractive'
import colorLog from '../utils/colorLog'
import fs from 'fs'

export default async () => {
    const projectName = process.env.PROJECT_DIR.split('/').slice(-1)[0]
    colorLog(`Welcome to the Interactive CLI for '${projectName}'`)

    if (process.env.CI_MODE) {
        colorLog('Interactive CLI not available in CI Mode', 'error')
        return
    }
    const { stdout: stacksRaw } = child_process.spawnSync('sh', ['-c', "ls -A1q /project/stacks/"], { encoding: 'utf-8' })
    const { stdout: runningComposeRaw } = child_process.spawnSync('sh', ['-c', "docker-compose ls -q"], { encoding: 'utf-8' })
    const stacks = stacksRaw.split('\n').filter(s => s)
    const runningCompose = runningComposeRaw.split('\n').filter(s => s)

    const stackOptions = []
    for (const stack of stacks) {
        const hasDevFiles = !!fs.readdirSync(`/project/stacks/${stack}`).find(f => f.endsWith('.dev.yml'))
        const running = runningCompose.includes(`${projectName.toLowerCase()}_${stack.toLowerCase()}`)
        stackOptions.push({
            name: `${stack} (Running: ${running ?
                '\x1b[32m✔\x1b[0m' : '\x1b[31m✖\x1b[0m'
                }  )`,
            value: { stack, dev: false, running }
        })
        if (hasDevFiles) {
            const running = runningCompose.includes(`${projectName.toLowerCase()}_${stack.toLowerCase()}_dev`)
            stackOptions.push({
                name: `${stack} [DEV] (Running: ${running ?
                    '\x1b[32m✔\x1b[0m' : '\x1b[31m✖\x1b[0m'
                    }  )`,
                value: { stack, dev: true, running }
            })
        }
    }

    const { stack: { stack, dev, running } } = await inquirer.prompt([{
        type: 'list',
        name: 'stack',
        message: 'Desired Stack?',
        pageSize: 40,
        choices: stackOptions
    }])

    const { operation } = await inquirer.prompt([{
        type: 'list',
        name: 'operation',
        message: `Desired ${stack} operation: (Running: ${running ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✖\x1b[0m'} )`,
        choices: running ? [
            { name: 'Stop', value: 'stop' },
            { name: 'Restart', value: 'restart' },
            { name: 'Connect to logs', value: 'log' }
        ] : [
            { name: 'Start', value: 'start' }
        ]
    }])

    const { log } = operation != 'log' && operation != 'stop' && await inquirer.prompt([{
        type: 'list',
        name: 'log',
        message: `Do you want to connect to the logs after starting?`,
        choices: [
            { name: 'No', value: false },
            { name: 'Yes', value: true },
        ]
    }])

    await nonInteractive([
        operation,
        stack,
        ...(log ? ['-l'] : []),
        ...(dev ? ['-dev'] : [])
    ])

}