import * as fs from 'fs'
import mergeYaml from 'merge-yaml'
import bash from '../utils/bash'
import updateImages from '../utils/updateImages'

const getComposeArgs = (stack, dev = false) => {
    const projectName = process.env.PROJECT_DIR.split('/').slice(-1)[0]
    const stack_id = `${projectName.toLowerCase()}_${stack.toLowerCase()}${dev ? '_dev' : ''}`
    const ymlFiles = fs.readdirSync(`/project/stacks/${stack}`)
        .filter(f => f.endsWith('.yml') && (dev || !f.endsWith('.dev.yml')))
        .sort((a, b) => {
            if (a.endsWith('.dev.yml')) {
                return 1
            } else if (b.endsWith('.dev.yml')) {
                return -1
            } else {
                return 0
            }
        })
    //console.log({ ymlFiles })
    return ymlFiles.map(f => `-f /project/stacks/${stack}/${f}`).join(' ') + ` -p ${stack_id}`
}

export const start = async (args) => {
    const log = !!args.find(a => a == '-l')
    const dev = !!args.find(a => a == '-dev')
    const stacks = args.filter(a => a != '-l' && a != '-dev')

    await prepareImages(stacks, dev)
    for (const stack of stacks) {
        const composeArgs = getComposeArgs(stack, dev)
        await bash(`docker-compose ${composeArgs} up -d`, { liveOnly: true, log: true, alias: 'Start Docker Compose' })
        if (log) {
            await logStack(stack, dev)
        }
    }
}

export const logStack = async (stack, dev = false) => {
    const composeArgs = getComposeArgs(stack, dev)
    await bash(`docker-compose ${composeArgs} logs -f`)
}

export const stop = async (args) => {
    const dev = !!args.find(a => a == '-dev')
    const stacks = args.filter(a => a != '-l' && a != '-dev')
    for (const stack of stacks) {
        const composeArgs = getComposeArgs(stack, dev)
        await bash(`docker-compose ${composeArgs} down`, { silent: true, log: true, alias: 'Stop Docker Compose' })
    }
}

export const restart = async (args) => {
    await stop(args)
    await start(args)
}

export const prepareImages = async (stacks, dev = false) => {
    const requiredImages = {}
    for (const stack of stacks) {
        const ymlFiles = fs.readdirSync(`/project/stacks/${stack}`)
            .filter(f => f.endsWith('.yml') && (dev || !f.endsWith('.dev.yml')))
            .sort((a, b) => {
                const aDev = a.endsWith('.dev.yml')
                const bDev = b.endsWith('.dev.yml')
                return aDev < bDev ? -1 : 1
            })
        const yamlMerge = mergeYaml(ymlFiles.map(f => `/project/stacks/${stack}/${f}`))
        for (const service of Object.values(yamlMerge.services) || []) {
            if (service.build) {
                const tag = service.image
                let path
                if (service.build.context) {
                    path = `${service.build.context.replace('${PROJECT_DIR}', '/project')}/${service.build.dockerfile}`
                } else {
                    path = `${service.build.replace('${PROJECT_DIR}', '/project')}/Dockerfile`
                }
                requiredImages[tag] = path
            }
        }
    }

    await updateImages(requiredImages)
}