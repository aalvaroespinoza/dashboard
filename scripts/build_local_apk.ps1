# build_local_apk.ps1
# Script para configurar Android SDK y compilar el APK de MiHub localmente

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$sdkDir = 'C:\Users\alvar\AppData\Local\Android\Sdk'
$cmdlineLatest = $sdkDir + '\cmdline-tools\latest'
$javaHome = 'C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot'

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   COMPILACION LOCAL DE APK (MiHub)      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Configurar JAVA_HOME
$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $sdkDir
$env:PATH = $javaHome + '\bin;' + $cmdlineLatest + '\bin;' + $sdkDir + '\platform-tools;' + $env:PATH

Write-Host "[1/5] Verificando Java 17..." -ForegroundColor Yellow
$javaExe = $javaHome + '\bin\java.exe'
& $javaExe -version

# 2. Descargar e instalar Command-line Tools de Google si no existen
$sdkManager = $cmdlineLatest + '\bin\sdkmanager.bat'
if (-not (Test-Path $sdkManager)) {
    Write-Host "[2/5] Descargando Android SDK Command-line Tools (~140MB)..." -ForegroundColor Yellow
    $zipUrl = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip'
    $tempZip = Join-Path $env:TEMP 'cmdline-tools.zip'
    $tempExtract = Join-Path $env:TEMP 'cmdline_extracted'

    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip

    Write-Host "Extrayendo herramientas de Android SDK..." -ForegroundColor Yellow
    if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
    Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

    $cmdlineFolder = $sdkDir + '\cmdline-tools'
    New-Item -ItemType Directory -Force -Path $cmdlineFolder | Out-Null
    if (Test-Path $cmdlineLatest) { Remove-Item $cmdlineLatest -Recurse -Force }
    $extractedFolder = $tempExtract + '\cmdline-tools'
    Move-Item -Path $extractedFolder -Destination $cmdlineLatest -Force

    Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
}

# 3. Instalar Build-Tools y Platform-Tools requeridos
Write-Host "[3/5] Instalando plataformas y Build-Tools de Android..." -ForegroundColor Yellow

try {
    $licenseInput = @('y','y','y','y','y','y','y','y')
    $licenseInput | & $sdkManager --licenses | Out-Null
} catch {
    # Continuar si ya estan aceptadas
}

$argPlatform = 'platforms;android-35'
$argBuildTools = 'build-tools;35.0.0'
$argPlatformTools = 'platform-tools'
& $sdkManager $argPlatform $argBuildTools $argPlatformTools

# 4. Asegurar android/local.properties y generar prebuild si es necesario
Write-Host "[4/5] Preparando configuracion nativa de Android..." -ForegroundColor Yellow
if (-not (Test-Path '.\android')) {
    npx expo prebuild --platform android --clean
}

$localPropsContent = 'sdk.dir=C:\\Users\\alvar\\AppData\\Local\\Android\\Sdk'
Set-Content -Path '.\android\local.properties' -Value $localPropsContent

# 5. Compilar el APK con Gradle
Write-Host "[5/5] Compilando APK Standalone con Gradle (assembleRelease)..." -ForegroundColor Yellow
Push-Location .\android
try {
    .\gradlew.bat assembleRelease --no-daemon --build-cache --parallel
} finally {
    Pop-Location
}

$apkPath = '.\android\app\build\outputs\apk\release\app-release.apk'
if (Test-Path $apkPath) {
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "   APK COMPILADO CON EXITO!              " -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "Ubicacion del archivo APK generado:" -ForegroundColor Green
    Write-Host (Resolve-Path $apkPath) -ForegroundColor White
} else {
    Write-Host "No se encontro el APK en la ruta esperada." -ForegroundColor Red
}
