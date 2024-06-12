const express = require('express');
const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const resource = process.env.RESOURCE;

app.use(express.json());

async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const requestBody = qs.stringify({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: `${resource}/.default`
  });

  const response = await axios.post(tokenUrl, requestBody, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data.access_token;
}

app.post('/api/create-record', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const createUrl = `${resource}/api/data/v9.0/accounts`;
    const response = await axios.post(createUrl, req.body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send(error.response ? error.response.data : error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
