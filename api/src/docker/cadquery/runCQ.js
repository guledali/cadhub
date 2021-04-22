const { exec } = require('child_process')
const { promises } = require('fs')
const { writeFile } = promises
const { nanoid } = require('nanoid')

module.exports.runCQ = async ({ file, settings = {} } = {}) => {
  const tempFile = await makeFile(file)
  const command = `cq-cli/cq-cli --codec stl --infile /tmp/${tempFile}/main.py --outfile /tmp/${tempFile}/output.stl`
  console.log('command', command)

  try {
    const result = await runCommand(command, 30000)
    return { result, tempFile }
  } catch (error) {
    return { error, tempFile }
  }
}

async function makeFile(file) {
  const tempFile = 'a' + nanoid() // 'a' ensure nothing funny happens if it start with a bad character like "-", maybe I should pick a safer id generator :shrug:
  console.log(`file to write: ${file}`)

  await runCommand(`mkdir /tmp/${tempFile}`)
  await writeFile(`/tmp/${tempFile}/main.py`, file)
  return tempFile
}

async function runCommand(command, timeout = 5000) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        console.log(`stderr: ${stderr}`)
        console.log(`stdout: ${stdout}`)
        reject(stdout || stderr) // it seems random if the message is in stdout or stderr, but not normally both
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        resolve(stderr)
        return
      }
      console.log(`stdout: ${stdout}`)
      resolve(stdout)
    })
    setTimeout(() => {
      reject('timeout')
    }, timeout)
  })
}
