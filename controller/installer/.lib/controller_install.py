#!/usr/bin/python
#Copyright:
#
#    Copyright (c) 2012-2014 by Brocade Communications Systems, Inc.
#    All Rights Reserved.
#
#License:
#
#This software is licensed, and not freely redistributable. See the
#license agreement for details.


import os, sys, shlex, glob, zipfile, subprocess, time,shutil,datetime,getopt
from subprocess import Popen, PIPE
from controller_prereq import getValidJAVAHOME, checkMemoryCPU
from bvc_install_common import logMessage, logAndPrintMessage, unzip, moveFile

def runCommand( cmd):
    process = subprocess.Popen(
                 cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE )
    outputStr = []
    for line in process.stdout:
        logMessage(line)
        outputStr.append(line)

    for line in process.stderr:
        logMessage(line)

    returnCode = process.wait()

    return outputStr, returnCode

def runSilentCommand( cmd):
    process = subprocess.Popen(
                 cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE )

def isControllerRunning():
    process = subprocess.Popen(['ps','-elf'], stdout=subprocess.PIPE)
    running = False
    for line in process.stdout:
        if 'org.apache.karaf' in line:
            running = True
    return running

def startController( controllerDir):
    if isControllerRunning() == False:
        logAndPrintMessage( ' Starting controller ... please wait ...' )
        os.chmod(controllerDir+'/bin/start', 0555)
        cmd = [ controllerDir+'/bin/start']
        runCommand( cmd )
        retries = 0
        while isControllerRunning() == False and retries < 10:
            retries += 1
            time.sleep(2)

        logAndPrintMessage( '                         ............... [ OK ]')
    return

def stopController( controllerDir):
    if isControllerRunning() == True:
        logAndPrintMessage( ' Stopping controller ... please wait ...')
        os.chmod(controllerDir+'/bin/stop', 0555)
        cmd = [ controllerDir+'/bin/stop']
        runCommand( cmd )
        retries = 0
        while isControllerRunning() == True and retries < 30:
            retries += 1
            time.sleep(2)
        logAndPrintMessage( '                         ............... [ OK ]')
    return

def installBaseExtensions( msg, installDir, karafInstallDir,
                       karafExtensionsDir, archiveDir ):

    if not isControllerRunning():
        startController( karafInstallDir )

    # extract repos, features & merge to new features.cfg file
    extList, repoList, origFeaturesName, newFeaturesName = mergeFeatureCfg( karafInstallDir )

    installFeatures( karafInstallDir, extList, repoList )

    logAndPrintMessage( msg + ' ... please wait ...')

    logAndPrintMessage( '                         ............... [ OK ]')

def installExtensions( msg, installDir, karafInstallDir,
                       karafExtensionsDir, archiveDir ):
    if not isControllerRunning():
        startController( karafInstallDir )

    # extract repos, features & merge to new features.cfg file
    extList, repoList, origFeaturesName, newFeaturesName = mergeFeatureCfg( karafInstallDir )

    installFeatures( karafInstallDir, extList, repoList )

    logAndPrintMessage( msg + ' ... please wait ...')
    restartControllerRequested = runCustomConfigInstall( karafInstallDir )

    # replace the original features.cfg with the merged file if it exists
    if ( newFeaturesName is not None and os.path.exists( origFeaturesName) ) :
        os.remove(origFeaturesName)
        os.rename(newFeaturesName,origFeaturesName)
        
    logAndPrintMessage( '                         ............... [ OK ]')
    
    return restartControllerRequested

def getZipList( extDir, topDir ):
    origDir = os.getcwd()
    os.chdir( topDir + extDir )
    extensionList = []
    for file in glob.glob("*.zip"):
            extensionList.append(file)
    os.chdir( origDir )
    return extensionList

def runCustomConfigInstall( karafHomeDir ):
    restartRequested=False
    if os.path.exists( karafHomeDir + '/etc/bvc-extensions' ):
        originalDir = os.getcwd()
        os.chdir(karafHomeDir + '/etc/bvc-extensions' )
        for file in glob.glob("*.install"):
            restartReturnCode = None
            configFileName = file.rstrip( ".install" ) + ".cfg"
            if os.path.exists( configFileName ):
                with open( configFileName ) as cfgfile:
                    for line in cfgfile:
                        if 'restartControllerOnCustomInstallRC =' in line:
                            restartReturnCode = int( line.lstrip( "restartControllerOnCustomInstallRC =" ) )
                            break

            os.chmod(file, 0555)
            cmd = ['./' + file]
            logMessage( "Running custom install script: " + file )
            output, rc = runCommand( cmd )
            if restartReturnCode != None:
                if int( rc ) == restartReturnCode:
                    logMessage( "Install script requested restart of controller." )
                    restartRequested = True
            logMessage( "Custom install script complete with code: " + str(rc) + ".\n**********Standard Output*******\n" + str(output) +
                        "\n*************************************\n")

        os.chdir( originalDir )
        
        return restartRequested

def setupKarafLogging( karafInstallDir, maxFileSize, maxBackupIndex ):
    cfgFName = karafInstallDir+'/etc/org.ops4j.pax.logging.cfg'
    newFName = cfgFName+'.new'
    newfile = open( newFName, 'w')
    with open( cfgFName ) as cfgfile:
        for line in cfgfile:
            if 'log4j.appender.out.maxFileSize=' in line:
                newfile.write( 'log4j.appender.out.maxFileSize='+maxFileSize+'MB\n')
            elif 'log4j.appender.out.maxBackupIndex=' in line:
                newfile.write( 'log4j.appender.out.maxBackupIndex='+maxBackupIndex+'\n')
            else:
                newfile.write( line )
    newfile.close()
    os.remove( cfgFName )
    os.rename( newFName, cfgFName )

######
# Method to collect existing and new extension karaf features & repos
# and merge into a single etc/org.apache.karaf.features.cfg file.
# Parameters: home directory of karaf
#     Looks for any file in the subdirectory karafhome/etc/bvc-extensions which
#     must contain two lists, one of features and one of repos:
#
#     featuresBoot = token1,token2,token3... tokenN
#     featuresRepositories = repoA,reposB,repoC ... repoZ
#
# Returns: list of new features, list of new repos, the original and new features
#          filenames.  The caller must replace the old with the new.
######

def mergeFeatureCfg( karafHomeDir):
    originalDir = os.getcwd()
    extensionFeatures = []
    extensionRepos = []
    newFeaturesFileName = None
    featuresFileName = karafHomeDir+'/etc/org.apache.karaf.features.cfg'

    if os.path.exists( karafHomeDir + '/etc/bvc-extensions' ):
        newFeaturesFileName = karafHomeDir+'/etc/org.apache.karaf.features.cfg.new'
        if os.path.exists( newFeaturesFileName ):
            os.remove( newFeaturesFileName )
        currentFeatures = []
        currentRepos = []
        extensionList = []

        os.chdir(karafHomeDir + '/etc/bvc-extensions' )
        for file in glob.glob("*"):
            extensionList.append(file)

            extFile = open(file)
            for line in extFile:
                if 'featuresBoot' in line:
                    featuresExt = line.split("=")
                    features = featuresExt[1]
                    features = features.replace(' ','').replace('\n','')
                    features = features.split(",")
                    for feature in features:
                        if not feature in extensionFeatures:
                            extensionFeatures.append(feature)
                        else:
                            logMessage( 'already have feature: '+ feature)
                elif 'featuresRepositories =' in line:
                    reposExt = line.split("=")
                    repos = reposExt[1]
                    repos = repos.replace(' ','').replace('\n','')
                    repos = repos.split(",")
                    for repo in repos:
                        if not repo in extensionRepos:
                            extensionRepos.append(repo)
                        else:
                            logMessage( 'already have repo: '+ repo)
            extFile.close()
        os.chdir( karafHomeDir )
        newFile = open (newFeaturesFileName,'w')
        with open( featuresFileName ) as cfgfile:
            for line in cfgfile:
                if 'featuresBoot=' in line:
                    newFile.write( '\nfeaturesBoot= ' )
                    baseFeatures = line.split("=")
                    baseFeatures = baseFeatures[1]
                    baseFeatures = baseFeatures.split(",")
                    for feat in baseFeatures:
                        feat = feat.replace('\n','')
                        feat = feat.replace(' ','')
                        currentFeatures.append(feat)
                    for feat in extensionFeatures:
                         if not feat in currentFeatures:
                            currentFeatures.append(feat)
                    comma = False
                    for feature in currentFeatures:
                        if comma == True:
                            newFile.write( ',' )
                        newFile.write( feature )
                        comma = True
                    newFile.write( '\n' )
                elif 'featuresRepositories =' in line:
                    newFile.write( '\nfeaturesRepositories = ' )
                    baseRepos = line.split("=")
                    baseRepos = baseRepos[1]
                    baseRepos = baseRepos.split(",")
                    for repo in baseRepos:
                        repo = repo.replace('\n','')
                        repo = repo.replace(' ','')
                        currentRepos.append(repo)
                    logMessage( str(extensionRepos))
                    for repo in extensionRepos:
                        if not repo in currentRepos:
                            currentRepos.append(repo)
                    comma = False
                    for repo in currentRepos:
                        if comma == True:
                            newFile.write( ',' )
                        newFile.write( repo )
                        comma = True
                    newFile.write( '\n' )
                else:
                    newFile.write( line )
        newFile.close( )
    else:
        logMessage( 'No bvc-extensions to be installed')

    os.chdir( originalDir )
    return extensionFeatures, extensionRepos, featuresFileName, newFeaturesFileName

def installFeatures( karafInstallDir, extList, repoList ):

    print " Adding Repositories ... please wait ..."
    for repo in repoList:
        logMessage( ' Adding repo '+repo+' ...')
        cmd = [karafInstallDir+'/bin/client','-r','60','-d','5','feature:repo-add',repo]
        runCommand( cmd )
    print "                       ................. [ OK ]"

    print " Installing Features ... please wait ..."
    for ext in extList:
        logMessage( ' Installing '+ext+' ...')
        cmd = [karafInstallDir+'/bin/client','-r','60','-d','5','feature:install',ext]
        runCommand( cmd )

    print "                       ................. [ OK ]"
