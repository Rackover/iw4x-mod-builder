#!groovy
def jobWorkspace(id, f) {
	ws("workspace/${env.JOB_NAME.replaceAll(/[%$]/, "_")}@$id", f)
}
// Job properties
properties([
	buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '30')),
	disableConcurrentBuilds(),
	gitLabConnection('iw4x'),
	[$class: 'LeastLoadDisabledProperty', leastLoadDisabled: false]
])

gitlabBuilds(builds: [
	"Build",
	"Archiving"
]) {
	stage("Build") {
		gitlabCommitStatus("Build") {
			node("windows") {
				jobWorkspace("build") {
					retry(5) {
						checkout scm
					}
					bat "npm install gulp-cli -g"
					bat "npm install"
					bat "gulp"
					
					archiveArtifacts artifacts: "build/*.exe,package.json", fingerprint: true
				}
			}
		}
	}
}
