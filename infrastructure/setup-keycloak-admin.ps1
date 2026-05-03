$keycloakUrl = "http://localhost:8080"
$realm = "reno"
$adminUser = "admin_axis@reno.com"
$adminPassword = "Admin@123"

# 1. Get admin token from master realm
Write-Host "Getting admin token..."
$tokenResponse = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" `
  -Method POST -ContentType "application/x-www-form-urlencoded" `
  -Body "client_id=admin-cli&username=admin&password=admin&grant_type=password"
$token = $tokenResponse.access_token
Write-Host "✅ Admin token obtained"

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# 2. Get the admin role from the realm
Write-Host "Fetching 'admin' role from realm '$realm'..."
$adminRole = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/roles/admin" -Headers $headers
Write-Host "✅ Role found: $($adminRole.name) (id: $($adminRole.id))"

# 3. Check if admin_axis user already exists
Write-Host "Looking up user '$adminUser'..."
$users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users?email=$adminUser" -Headers $headers

if ($users.Count -eq 0) {
    # 4. Create the user
    Write-Host "User not found. Creating '$adminUser'..."
    $newUser = @{
        username = $adminUser
        email = $adminUser
        firstName = "Axis"
        lastName = "Administrator"
        enabled = $true
        emailVerified = $true
        credentials = @(@{ type = "password"; value = $adminPassword; temporary = $false })
        realmRoles = @("admin")
    } | ConvertTo-Json -Depth 5

    $createResponse = Invoke-WebRequest -Uri "$keycloakUrl/admin/realms/$realm/users" `
      -Method POST -Headers $headers -Body $newUser
    Write-Host "✅ User created (HTTP $($createResponse.StatusCode))"
    
    # Re-fetch user
    $users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users?email=$adminUser" -Headers $headers
}

$userId = $users[0].id
Write-Host "User ID: $userId"

# 5. Assign admin role to the user
Write-Host "Assigning 'admin' realm role to user..."
$roleAssign = @($adminRole) | ConvertTo-Json -AsArray
Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users/$userId/role-mappings/realm" `
  -Method POST -Headers $headers -Body $roleAssign | Out-Null
Write-Host "✅ 'admin' role assigned to $adminUser"

# 6. Verify
$assignedRoles = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users/$userId/role-mappings/realm" -Headers $headers
Write-Host "Current roles: $(($assignedRoles | ForEach-Object { $_.name }) -join ', ')"
Write-Host ""
Write-Host "🎉 Done! $adminUser can now log in with password: $adminPassword"
