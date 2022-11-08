export default (msg, type = 'info') => {
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