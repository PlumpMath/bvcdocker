#!/usr/bin/python
#
# Copyright (c) 2014 Brocade Communications Systems, Inc. and others.  All rights reserved.
#
#

import re,os, sys, shlex, glob, zipfile, subprocess, time,shutil,datetime,getopt,json,re,sys
from pprint import pprint
from subprocess import Popen, PIPE
from bvc_install_common import logAndPrintMessage,unzip,moveFile,decorateDirectoryName
from os.path import expanduser
#from install_bvc import unzip

# the install-bvc script is in the same directory as the karaf.zip
#
# Setup global variables and process commandline arguments


gArchiveDir = ""
acceptLicense = False

NODE_REQ_MAJOR_VERSION = 0;
NODE_REQ_MINOR_VERSION = 10;
NODE_REQ_REV_VERSION = 29;

modulesCue = 'begin_bvc_modules'
packagesCue = 'begin_bvc_packages'
controller ='localhost'

baseUIComponentsZipFilePatterns= ["bvc-core-odl-web*.zip","bvc-core-bvc-web*.zip"]

def checkForNode():
        nodeVersionPassed = False
        proc = subprocess.Popen(["node --version"], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        tmp = proc.communicate()[0]
        #tmp = 'v0.11.2'
        if tmp:
            version = tmp.split('.')
            if(len(version)) >= 3:
                majorVersion = int(re.sub("[^0-9]","",version[0]))
                minorVersion = int(version[1])
                revVersion = int(version[2])
                if(majorVersion > NODE_REQ_MAJOR_VERSION) :
                      nodeVersionPassed = True
                if(majorVersion == NODE_REQ_MAJOR_VERSION and  minorVersion > NODE_REQ_MINOR_VERSION):
                       nodeVersionPassed = True
                if(majorVersion == NODE_REQ_MAJOR_VERSION and minorVersion ==  NODE_REQ_MINOR_VERSION and revVersion >= NODE_REQ_REV_VERSION):
                       nodeVersionPassed = True
        if nodeVersionPassed == True:
            printMsg(" NODEJS Check: ......................... [ OK ]")
        else:
            printMsg(" NODEJS Check: ......................... [ FAILED ]")
        return nodeVersionPassed

def getHostName(controllerNode='localhost'):
        hostName = controllerNode
        if(controllerNode == 'localhost' or controllerNode == '127.0.0.1'):
            command = "ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1'"
            #command = "hostname"
            proc = subprocess.Popen([command], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            hostNameLines = proc.communicate()[0]
            hostName =  hostNameLines.splitlines()
            if len(hostName) > 0:
                hostName = hostName[0]
            else:
                hostName = controllerNode
        return hostName

def replaceHostNameInConfFile(hostName,destinationDir):
    replaceHostName( hostName,destinationDir, 'config.json')

def replaceHostName( hostName, destinationDir, file ):
    fileName = destinationDir + file
    newFileName = fileName+'.new'
    if os.path.exists(newFileName):
        os.remove(newFileName)
    infile = open(fileName)
    outfile = open(newFileName, 'w')
    for line in infile:
        line = line.replace('localhost',hostName)
        outfile.write(line)
    infile.close()
    outfile.close()
    os.remove(fileName)
    os.rename(newFileName,fileName)

# This method should be invoked when UI installer is driven  by an external master installer
def installUI(topInstallDir,destinationDir,zipFileDir,archiveDir,controller):
     returnCode = 0
     controllerNode = getHostName(controller)
     global gArchiveDir
     gArchiveDir = archiveDir
     stopNodeJs()
     baseInstallSuccess = True
     replaceHostNameInConfFile(controllerNode,decorateDirectoryName(destinationDir))

     configureExtensionForWeb( decorateDirectoryName( destinationDir ))

     startNodeJs(destinationDir)
     if(baseInstallSuccess == True):
         printMsg(' UI Installation: ...................... [ OK ]')
     else:
         returnCode = -1
     return returnCode

def copyFiles(zipFileDir):
    if(len(glob.glob( zipFileDir +"*.zip")) > 0):
        print "Copying required files..."
        for zFile in glob.glob('../*ODLUI*.zip'):
           shutil.copy(zFile, "./")

def printMsg(message):
     #print message
     logAndPrintMessage(message)

def unzipBaseUIFiles(zipFileDir,destinationDir):
    for zipPattern in  baseUIComponentsZipFilePatterns:
        filePattern = zipFileDir + zipPattern
        files = glob.glob(filePattern)
        if( len(files) > 0 ):
            unzipFile(files[0],destinationDir)

def moveBaseUIZipFiles(zipFileDir,archiveDirForFiles):
    for zipPattern in  baseUIComponentsZipFilePatterns:
        filePattern = zipFileDir + zipPattern
        files = glob.glob(filePattern)
        if( len(files) > 0 ):
            moveFile( files[0], archiveDirForFiles )

def unzipFile(fileName,destinationDir):
    unzip(fileName,destinationDir);

def restartNodeJs():
    stopNodeJs()
    startNodeJs()

def startNodeJs(destinationDir):
    os.chdir(destinationDir)
    command = 'echo "Starting NODEJS server - $(date)" >> ../log/web.log && node server.js'

    logfile = open( "../log/web.log", 'a' )
    inputdevnull = open( "/dev/null" );

    proc = subprocess.Popen([command], shell=True, stdout=logfile, stderr=logfile, stdin=inputdevnull )

    logfile.close()
    inputdevnull.close()

    # hostNameLines = proc.communicate()[0]
    printMsg(" Starting NODEJS: ...................... [ OK ]")
    printMsg("    Server @ http://"+getHostName()+":9000/")

def stopNodeJs():
    command = "kill -9 $(ps aux | grep '\snode\s' | awk '{print $2}')"
    proc = subprocess.Popen([command], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    hostNameLines = proc.communicate()[0]
    printMsg(" Stopping NODEJS: ...................... [ OK ]")

def configureExtensionForWeb(baseWebDirectory):

    installFiles = glob.glob(baseWebDirectory +"install-*.json")
    globalAppConfigFile = baseWebDirectory + 'config.json'

    for installFile in installFiles:
        appConfigFile  = open(installFile)
        appConfig = json.load(appConfigFile)
        appConfigFile.close()
    
        for item in appConfig['install']:
           srcFileName = baseWebDirectory + item['src']
           #print "processing file: " + srcFileName
           srcFile = open(srcFileName)
           fileTextAsList = re.compile("\r\n|\n").split(srcFile.read())
           srcFile.close()
           if '\n'.join(item['data']) not in fileTextAsList:
               index = next((index for index,value in enumerate(fileTextAsList) if value.strip() == item['cue']),-1)
               if (index > -1):
                   fileTextAsList.insert(index, '\n'.join(item['data']))
                   outputFile = open(srcFileName, "w")
                   outputFile.write('\n'.join(fileTextAsList))
                   outputFile.close()
       
        #Updating the config section 
        if 'config' in appConfig:
            configSection = appConfig['config']
            configFile = open(globalAppConfigFile)
            configFileJson = json.load(configFile)
            configFile.close()
            #print json.dumps(configFileJson)
            configFileJson["default"].update(configSection)
            #print json.dumps(configFileJson)
            configFile = open(globalAppConfigFile,"w")
            json.dump(configFileJson, configFile)
            configFile.close()
        
       
