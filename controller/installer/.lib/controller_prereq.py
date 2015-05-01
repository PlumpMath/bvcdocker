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
from bvc_install_common import logMessage, logAndPrintMessage


# gets the version number of the java installed on the arg path
# Sets the check_JDK boolean to true if the java version is equal or greater than the recommended version
def checkJDKVersion( JAVA_HOME,req_ver,recommended_rev):
    check_JDK = False
    if JAVA_HOME:
        proc = subprocess.Popen([JAVA_HOME + "/bin/java -version"], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        tmp = proc.communicate()[1]
        if tmp:
            if tmp.split('"'):
                if len(tmp.split('"')) > 1:
                    curr_ver = tmp.split('"')[1]
                    if curr_ver:
                        if curr_ver.split('_'):
                            if curr_ver.split('_')[0] == req_ver:
                                check_JDK = True
                                if len(curr_ver.split('_')) >= 2:
                                    if curr_ver.split('_')[1] < recommended_rev:
                                        logAndPrintMessage( 'WARNING : Recommended JAVA '+req_ver+' revision is '+recommended_rev+' or greater')
    return check_JDK

def getValidJAVAHOME(installDir):
    REQ_VER = '1.7.0'
    RECOMMENDED_REV = '67'
    JAVA_HOME = os.getenv("JAVA_HOME")
    check_JDK = False

# This method takes the JAVA_HOME path as a string arg
    while (check_JDK == False):
        if JAVA_HOME:
           check_JDK = checkJDKVersion( JAVA_HOME, REQ_VER, RECOMMENDED_REV)
        if(check_JDK == True):
            logAndPrintMessage( "\n JDK Check ............................. [ OK ]") 
        else:
            JAVA_HOME = raw_input("\nRequired JAVA version is \"1.7.0\" Recommended revision is 67 or greater\nEnter the path to the Required JAVA Version:\n")
    return check_JDK, JAVA_HOME


def setupSetenv( distDir, JAVA_HOME, xmxValue, maxPS):
    logMessage( 'Updating JAVA_MAX_MEM, JAVA_MAX_PERM_SIZE in bin/setenv ...' )
    setenvFilename = distDir+'/bin/setenv'

    # can we open the new file with truncate? delete for now
    if os.path.isfile( setenvFilename+'.new' ):
        os.remove( setenvFilename+'.new')
    newf = open(setenvFilename+'.new', "w")
    with open( setenvFilename ) as f:
        for line in f:
            # the stock file checks for env vars already set to allow override
            # but we don't allow override so strip out the conditional code.
            if 'x$JAVA_MAX_PERM_MEM' in line or 'x$JAVA_MAX_MEM' in line:
                for line in f:
                    # skip the next line
                    for line in f:
                        break;
                    break;
            elif ( 'export JAVA_HOME' in line ):
                newf.write( 'export JAVA_HOME='+JAVA_HOME+'\n' )
            elif ( 'export JAVA_MAX_MEM' in line ):
                newf.write('export JAVA_MAX_MEM='+str(xmxValue)+'m\n' )
            elif ( 'export JAVA_MAX_PERM_MEM' in line ):
                newf.write('export JAVA_MAX_PERM_MEM='+str(maxPS)+'m\n' )
            else:
                newf.write(line)
    newf.close()
    os.remove( setenvFilename )
    os.rename( setenvFilename+'.new',setenvFilename)

# This function should work for both Centos6 and Ubuntu 14.04

def checkMemoryCPU( ignoreErrors, installDir, JAVA_HOME): 
    maxXmxValue     = 12 * 1024
    minCPUspeed     = 2.0
    minCPUcount     = 2
    minMemory       = 4 * 1024
    xmxValue        = 2 * 1024
    maxPS           = int(512)
    
    availableMemory = '1024'
    CPUspeed        = 0
    CPUcount        = 0
    
    cmd = "lscpu"
    process = Popen(shlex.split(cmd), stdout=PIPE)
    out, err = process.communicate()
    outLines = out.split('\n')
    
    for aLine in outLines:
        if 'CPU MHz:' in aLine:
            CPUspeed = float(aLine.split(':')[1])
        if ( 'CPU(s):' in aLine and 'NUMA' not in aLine ):
            CPUcount = aLine.split(':')[1] 
    
    with open( '/proc/meminfo' ) as f:
        for line in f:
            if 'MemTotal:' in line:
                availableMemory = int(line.split('k')[0].split(':')[1])
                availableMemory = availableMemory/1024
    f.close()
            
    sufficient = True
    
    cpuSpeedStr = ' CPU Speed Check: ...................... ['
    cpuCountStr = ' CPU Count Check: ...................... ['
    memoryStr = ' Memory Size Check: .................... ['
    if int(CPUspeed) < minCPUspeed:
        logMessage(
    '\nYour systems CPU speed is '+str(CPUspeed)+' but should be '+str(minCPUspeed)+' or more to ensure acceptable performance.')
        cpuSpeedStr += ' FAILED ]'
        sufficient = False
    else:
        cpuSpeedStr += ' OK ]'
    
    if int(CPUcount) < minCPUcount:
        logMessage(
    '\nYour systems CPU count is '+str(CPUcount)+' but should be '+str(minCPUcount)+' or more to ensure acceptable performance.')
        cpuCountStr += ' FAILED ]'
        sufficient = False
    else:
        cpuCountStr += ' OK ]'
    
    if int(availableMemory) < minMemory:
        logMessage(
    '\nYour system\'s available memory is '+str(availableMemory)+'m. This does not meet the minimum memory requirements. Please refer to the system requirements.')
        sufficient = False
        memoryStr += ' FAILED ]'
    else:
        memoryStr += ' OK ]'

    logAndPrintMessage ( cpuSpeedStr)
    logAndPrintMessage ( cpuCountStr)
    logAndPrintMessage ( memoryStr)

    if sufficient == False:
        logAndPrintMessage(
    '\nThis system will not sustain a controller, please increase')
        logAndPrintMessage(
    'the required resources for best results.')

        if ignoreErrors == False:
            return False, 0, 0

    xmxValue = int(0.85 * availableMemory)
    if int(xmxValue) >= int(maxXmxValue):
        logAndPrintMessage(
    'Java processes exceeding '+str(maxXmxValue)+' MB may run into')
        logAndPrintMessage(
    'GC issues, so we cap memory at that limit.')
        xmxValue = maxXmxValue

    return True, xmxValue, maxPS
