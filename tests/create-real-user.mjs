import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execSync);

async function createRealUser() {
  console.log("1. Authenticating as Keycloak Admin...");
  const adminTokenResp = await fetch("http://localhost:8080/realms/master/protocol/openid-connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "client_id=admin-cli&username=admin&password=admin&grant_type=password"
  });
  const adminToken = (await adminTokenResp.json()).access_token;

  console.log("2. Checking if user exists...");
  const usersResp = await fetch("http://localhost:8080/admin/realms/reno/users?username=realuser", {
    headers: { "Authorization": `Bearer ${adminToken}` }
  });
  const users = await usersResp.json();
  let userId;
  if (users.length > 0) {
    userId = users[0].id;
    console.log("User already exists! ID:", userId);
  } else {
    console.log("3. Creating realuser in reno realm...");
    const createResp = await fetch("http://localhost:8080/admin/realms/reno/users", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: "realuser",
        enabled: true,
        email: "realuser@reno.com",
        firstName: "Real",
        lastName: "User",
        credentials: [{
          type: "password",
          value: "Realpassword1!",
          temporary: false
        }]
      })
    });
    if (!createResp.ok) {
        console.log(await createResp.text());
        throw new Error("Failed to create user");
    }
    console.log("User created successfully!");
  }
}

createRealUser().catch(console.error);