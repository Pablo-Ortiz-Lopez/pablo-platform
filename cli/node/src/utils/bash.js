import { spawn } from 'child_process';
import { createSpinner } from './colorLog';


export default (command, {
    alias,
    log = false,
    silent = false,
    container,
    critical = true,
    liveOnly = false,
    returnStd = false // By default, it returns a boolean of whether it succeeded. With this option it will return the std object
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
        spinner = createSpinner(commandName)
    }

    const std = {
        stdout: [],
        stderr: [],
    }
    const mergedStd = []

    //! silent && run.stdout.pipe(process.stdout);
    //! silent && run.stderr.pipe(process.stderr);
    if (!liveTerminal) {
        run.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (!silent && !liveOnly) process.stderr.write(`\x1b[34m${line}\n\x1b[0m`);
                std.stdout.push(line)
                mergedStd.push({ pipe: 'stdout', line })
            }
        });
        run.stderr.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (!silent && !liveOnly) process.stderr.write(`\x1b[31m${line}\n\x1b[0m`);
                std.stderr.push(line)
                mergedStd.push({ pipe: 'stderr', line })
            }
        });
    }

    run.on('close', (code) => {
        if (!code) {
            if (spinner) spinner.end('ok')
            resolve(returnStd ? std : true);
        } else if (critical) {
            if (spinner) spinner.end('error')
            for (const { pipe, line } of mergedStd) {
                const colorCode = pipe == 'stderr' ? '31' : '0'
                process[pipe].write(`\x1b[${colorCode}m${line}\n\x1b[0m`);
            }
            reject(returnStd ? std : commandName);
        } else {
            if (spinner) spinner.end('error')
            resolve(returnStd ? std : false);
        }
    });
});
