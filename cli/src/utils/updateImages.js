import * as fs from 'fs'
import crypto from 'crypto'
import colorLog from '../utils/colorLog'
import bash from '../utils/bash'

const hashFile = (path) => {
    const fileBuffer = fs.readFileSync(path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    return hashSum.digest('hex');
}

export default async (requiredImages, buildIfMissing = true) => {
    console.log({ requiredImages })
    const built = []
    let dockerfileHashes = {}

    try {
        dockerfileHashes = JSON.parse(fs.readFileSync('/project/data/dockerfileHashes.json').toString())
    } catch (e) { }


    for (const tag of Object.keys(requiredImages)) {
        const file = requiredImages[tag]
        const newHash = hashFile(file)
        if (dockerfileHashes[tag] !== newHash) {
            if (dockerfileHashes[tag] || buildIfMissing) {
                colorLog(dockerfileHashes[tag] ?
                    `Dockerfile for image ${tag} has changed` :
                    `Image ${tag} is missing from Docker`
                    , 'warn')
                const directory = file.split('/').slice(0, -1).join('/')
                await bash(
                    `docker build -t ${tag} ${directory} -f ${file} `,
                    { log: true, alias: `Build Docker image: ${tag}`, silent: true }
                )
                built.push(tag)
            }
            dockerfileHashes[tag] = newHash
        } else {
            colorLog(`Image ${tag} is up-to-date`, 'ok')
        }
    }

    fs.writeFileSync("/project/data/dockerfileHashes.json", JSON.stringify(dockerfileHashes, null, 4))
    return built
}