import { logStack, restart, start, stop } from "../utils/stacks";
import colorLog from "../utils/colorLog";
import fs from 'fs'
import updateImages from "../utils/updateImages";
import bash from "../utils/bash";

export default async (args) => {
    switch (args[0]) {
        case 'start':
            await start([...args].splice(1))
            break;
        case 'stop':
            await stop([...args].splice(1))
            break;
        case 'restart':
            await restart([...args].splice(1))
            break;
        case 'log':
            const filteredArgs = args.filter(a => a != '-dev')
            const dev = !!args.find(a => a != '-dev')
            await logStack(filteredArgs[1], dev)
            break;
        default:
            if (fs.existsSync('/project/cli')) { // Try to run unknown commands with custom cli if available
                const projectDir = process.env.PROJECT_DIR
                const projectName = (projectDir.split('/').slice(-1)[0]).toLowerCase()
                await updateImages({
                    [`pablo/${projectName}-cli`]: `/project/cli/Dockerfile`
                }, true)
                await bash(`cd /project && cli/start.sh ${args.join(' ')}`)
            } else {
                colorLog(`Specified operation ${[...process.argv].splice(2).join(' ')} unrecognized.`, 'error')
            }
            break;
    }
    process.exit();
}