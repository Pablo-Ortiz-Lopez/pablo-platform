import { logStack, restart, start, stop } from "../scripts/stacks";
import colorLog from "../utils/colorLog";

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
            colorLog(`Specified operation ${[...process.argv].splice(2).join(' ')} unrecognized.`, 'error')
            break;
    }
    process.exit();
}