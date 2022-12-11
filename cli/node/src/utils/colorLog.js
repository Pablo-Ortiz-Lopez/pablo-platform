import { createSpinner as createSpinnerLib } from "nanospinner"

export const createSpinner = (message) => {
    let spinner
    if (process.env.CI_MODE != '1') { // ! CI_MODE
        spinner = createSpinnerLib(message).start()
    } else {
        colorLog(message, 'run')
    }

    return {
        end: (result = 'ok') => {
            if (spinner) { // ! CI_MODE
                if (result == 'ok') {
                    spinner.success()
                } else {
                    spinner.error()
                }
            } else {
                colorLog(message, result)
            }
        }
    }
}

export const colorLog = (msg, type = 'info') => {
    switch (type) {
        case 'error':
            console.log(`\x1b[31m✖ ${msg}\x1b[0m`);
            break;
        case 'warn':
            console.log(`\x1b[93m⚠️  ${msg}\x1b[0m`);
            break;
        case 'ok':
            console.log(`\x1b[32m✔\x1b[0m ${msg}`);
            break;
        case 'run':
            console.log(`\x1b[34m⚙\x1b[0m ${msg}\x1b[0m`);
            break;
        default:
            console.log(`\x1b[34mℹ️ ${msg}\x1b[0m`);
            break;
    }
}

export default colorLog