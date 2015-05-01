
#!/usr/bin/python
#
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

logFile = None
def setupLog( logDir,logFileName ):
    global logFile
    logFile = logDir+'/'+logFileName
    if not os.path.exists( logDir ):
        os.path.mkdir(logDir)

def logMessage( line ):
    global logFile
    if logFile is None:
        print 'Error: logMessage called before setupLog'
        sys.exit(1)

    with open( logFile, "a") as logfile:
        if not line.endswith('\n') :
            logfile.write(line+'\n')
        else:
            logfile.write(line)
        logfile.close()

def logAndPrintMessage( line ):
    logMessage(line)
    print line

def unzip(zipFilePath, destDir):
    if not os.path.exists( destDir ):
        os.makedirs( destDir )
    zfile = zipfile.ZipFile(zipFilePath)
    for name in zfile.namelist():
        (dirName, fileName) = os.path.split(name)
        if fileName == '':
            # directory
            newDir = destDir + '/' + dirName
            if not os.path.exists(newDir):
                os.mkdir(newDir)
        else:
            # file ... effectively overwrite existing files
            if os.path.isfile(destDir + '/' + name):
                os.remove(destDir + '/' + name)
            fd = open(destDir + '/' + name, 'wb')
            fd.write(zfile.read(name))
            fd.close()
    zfile.close()

def moveFile(srcFile,destDir):
    fileMoved = True
    fileExisted = False
    fileName = srcFile.split('/')[-1]
    if(destDir.endswith("/") == False):
       destDir = destDir + "/"
    destFileName = destDir + fileName
    success, fileExisted = removeExistingFile(destFileName)
    if success == True:
        fileExisted = True
        try:
          shutil.move( srcFile, destDir )
        except OSError, e:
            fileMoved =False
    else :
        fileMoved = False
    return fileMoved, fileExisted

def removeExistingFile(filename):
    fileRemoved = True
    fileExisted = False
    if os.path.isfile(filename):
       fileExisted = True
       try:
           os.remove(filename)
       except OSError, e:
            fileRemoved =False
    return fileRemoved, fileExisted

def decorateDirectoryName(directoryName):
    if(directoryName.endswith("/") == False):
       directoryName = directoryName + "/"
    return directoryName
