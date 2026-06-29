import { drive } from "./src/config/drive.config.js";



async function testDrive() {
  try {
    const response = await drive.files.list({
      pageSize: 10,
      fields: "files(id,name)"
    });

    console.log(response.data.files);
  } catch (error) {
    console.error(error);
  }
}

testDrive();