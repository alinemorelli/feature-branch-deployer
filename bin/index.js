#!/usr/bin/env node
'use strict'

const program = require('commander')
const pkg = require('../package.json')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const chalk = require('chalk')
const configEnvs = require('./config')

program.version(pkg.version)

const createTag = async function (tagName) {
  console.log(chalk.bold.cyan(`Creating tag ${tagName}`))
  await exec(`git tag -a -f ${tagName} -m qa`)
  console.log(chalk.bold.cyan(`Pushing tag ${tagName}`))
  return exec(`git push origin -f refs/tags/${tagName}`)
}

const checkoutAndUpdate = async function (branchName) {
  console.log(chalk.bold.cyan(`Updating branch ${branchName}`))
  return new Promise((resolve) => {
    exec(`git checkout ${branchName}`, async (err) => {
      if (err) throw new Error(chalk.bold.red(`Branch ${branchName} não existe`))
      await exec(`git pull origin ${branchName}`)
      resolve()
    })
  })
}

const mergeBranchs = async function (branchName) {
  console.log(chalk.bold.cyan(`Merging branch ${branchName}`))
  return new Promise((resolve) => {
    exec(`git merge ${branchName}`, async (err) => {
      if (err) {
        await exec(`git merge --abort`)
        throw new Error(chalk.bold.red(`CONFLICT: resolve before merge`))
      }
      console.log(chalk.bold.cyan(`Pushing branch qa__${branchName}`))
      await exec(`git push origin -f qa__${branchName}`)
      await createTag('testing')
      resolve()
    })
  })
}

program
  .command('test <baseBranch> <featureBranch>')
  .description('Create a new branch using baseBranch and featureBranch named qa__<featureBranch> and send it to origin')
  .action(async function test (baseBranch, featureBranch) {
    await exec(`git branch -D ${featureBranch}`)
    await exec('git fetch -p')
    await checkoutAndUpdate(featureBranch)
    await checkoutAndUpdate(baseBranch)
    await exec(`git checkout -B qa__${featureBranch}`)
    mergeBranchs(featureBranch)
  })

program
  .command('remove <featureBranch>')
  .description('Remove branch previously created for test purposes')
  .action(async function remove (featureBranch) {
    exec(`git remote show origin | grep "HEAD branch" | cut -d ":" -f 2`, async (_, mainBranch) => {
      console.log(`Deleting tag testing`)
      await exec(`git checkout${mainBranch}`)
      exec(`git push --delete origin testing`, (err) => {
        if (err) console.log(chalk.bold.red(`Tag testing not found`))
      })
      console.log(`Deleting branch qa__${featureBranch}`)
      exec(`git branch -D qa__${featureBranch} && git push origin --delete qa__${featureBranch}`, (err) => {
        if (err) console.log(chalk.bold.red(`Branch qa__${featureBranch} not found`))
      })
    })
  })

program
  .command('clear')
  .description('Create a new branch using dev branch named qa__ and send it to origin')
  .action(async function clear () {
    console.log(`Updating branchs`)
    await exec('git fetch -p')
    console.log(`Creating testing branch`)
    await checkoutAndUpdate('dev')
    await exec(`git checkout -B qa__`)
    console.log(chalk.bold.cyan(`Pushing branch qa__`))
    await exec(`git push origin -f qa__`)
    return createTag('testing')
  })

program
  .command('deploy')
  .description('Move tag to last commit off production/dev branch to deploy it')
  .option('-e, --environment [env]', 'Specifies the environment to deploy (production/homolog)')
  .action(async function deploy (options) {
    if (!options.environment) return console.log(chalk.bold.red(`You must specify the environment to deploy`))
    const config = configEnvs[options.environment]
    await checkoutAndUpdate(config.branch)
    await createTag(config.tag)
  })
program.parse(process.argv)
