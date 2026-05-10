@echo off
echo Generating self-signed SSL certificates for Nginx using Docker...
echo.

REM Create SSL directory if it doesn't exist
if not exist "nginx\ssl" mkdir nginx\ssl

REM Generate self-signed certificate using Docker
docker run --rm ^
    -v "%cd%\nginx\ssl:/etc/nginx/ssl" ^
    alpine/openssl ^
    req -x509 -nodes -days 365 -newkey rsa:2048 ^
    -keyout /etc/nginx/ssl/nginx.key ^
    -out /etc/nginx/ssl/nginx.crt ^
    -subj "/C=US/ST=State/L=City/O=Modulisation/CN=localhost" ^
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

if %errorlevel% equ 0 (
    echo.
    echo SUCCESS: SSL certificates generated in nginx/ssl/
    echo - nginx.crt (certificate)
    echo - nginx.key (private key)
    echo.
    echo WARNING: These are self-signed certificates for development only.
    echo For production, use Let's Encrypt or a trusted CA.
) else (
    echo.
    echo ERROR: Failed to generate SSL certificates.
    echo Make sure Docker is running and accessible.
)

echo.
pause
