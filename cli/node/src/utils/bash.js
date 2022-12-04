import { spawn } from 'child_process';
import colorLog from './colorLog';
import { createSpinner } from 'nanospinner'

const logStatus = (spinner, msg, result = 'ok') => {
    if (spinner) {
        if (result == 'ok') {
            spinner.success()
        } else {
            spinner.error()
        }
    } else {
        colorLog(msg, result)
    }
}

export default (command, {
    alias, log = false, silent = false, container, critical = true, liveOnly = false
} = {}) => new Promise((resolve, reject) => {
    const commands = typeof command === 'string' ? command : command.join(' && ');
    const commandName = alias || commands.split(' ')[0];

    let run;
    const liveTerminal = !process.env.CI_MODE == '1' && !silent
    const spawnArgs = liveTerminal ?
        {
            cwd: process.cwd(),
            detached: true,
            stdio: 'inherit'
        } : {}

    if (!container) {
        run = spawn('bash', ['-c', commands], spawnArgs);
    } else {
        run = spawn('docker', ['exec', container, 'sh', '-c', commands], spawnArgs);
    }

    let spinner
    if (log) {
        if (!process.env.CI_MODE == '1') {
            spinner = createSpinner(commandName).start()
        } else {
            colorLog(commandName, 'run')
        }
    }

    const savedLines = []

    //! silent && run.stdout.pipe(process.stdout);
    //! silent && run.stderr.pipe(process.stderr);
    if (!liveTerminal) {
        run.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (!silent && !liveOnly) process.stderr.write(`\x1b[34m${line}\n\x1b[0m`);
                savedLines.push(line)
            }
        });
        run.stderr.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (!silent && !liveOnly) process.stderr.write(`\x1b[31m${line}\n\x1b[0m`);
                savedLines.push(line)
            }
        });
    }

    run.on('close', (code) => {
        if (!code) {
            if (log) logStatus(spinner, commandName, 'ok')
            resolve(true);
        } else if (critical) {
            if (log && spinner) logStatus(spinner, commandName, 'error')
            for (const line of savedLines) process.stderr.write(`\x1b[31m${line}\n\x1b[0m`);
            reject(commandName);
        } else {
            if (log) logStatus(spinner, commandName, 'error')
            for (const line of savedLines) process.stderr.write(`\x1b[31m${line}\n\x1b[0m`);
            resolve(false);
        }
    });
});
