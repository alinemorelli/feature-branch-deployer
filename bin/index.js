#!/usr/bin/env node
'use strict'

const program = require('commander')
const pkg = require('../package.json')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const chalk = require('chalk')

program.version(pkg.version)

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
      await exec(`git push origin qa__${branchName}`)
      resolve()
    })
  })
}

program
  .command('deploy <baseBranch> <featureBranch>')
  .description('Create a new branch using baseBranch and featureBranch named qa__<featureBranch> and send it to origin')
  .action(async function deploy (baseBranch, featureBranch) {
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
      console.log(`Deleting branch qa__${featureBranch}`)
      await exec(`git checkout${mainBranch}`)
      exec(`git branch -D qa__${featureBranch} && git push origin --delete qa__${featureBranch}`, (err) => {
        if (err) console.log(chalk.bold.red(`Branch qa__${featureBranch} not found`))
      })
    })
  })

program.parse(process.argv)
