// // pages/api/payment.ts
// import got from "got";
// import { v4 as uuid } from "uuid";
// import crypto from "crypto";

// const clientId = "S2_af4543a0be4d49a98122e01ec2059a56";
// const secretKey = "9eb85607103646da9f9c02b128f2e5ee";
// const key = secretKey.substring(0, 32);
// const iv = secretKey.substring(0, 16);

// // TypeScript type for encrypt function
// const encrypt = (text, key, iv) => {
//   const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
//   let encrypted = cipher.update(text);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return encrypted.toString("hex");
// };

// // API route to handle registration
// export default async function handler(
//   req,
//   res
// ) {
//   if (req.method === "POST") {
//     try {
//       const { cardNo, expYear, expMonth, idNo, cardPw } = req.body;

//       // Construct the plaintext to encrypt
//       const plainText =
//         `cardNo=${cardNo}&expYear=${expYear}&expMonth=${expMonth}&idNo=${idNo}&cardPw=${cardPw}`;

//       // Encrypt the data
//       const encData = encrypt(plainText, key, iv);

//       // Make the request to the Nicepay API
//       const response = await got.post(
//         "https://sandbox-api.nicepay.co.kr/v1/subscribe/regist",
//         {
//           headers: {
//             Authorization:
//               "Basic " +
//               Buffer.from(`${clientId}:${secretKey}`).toString("base64"),
//             "Content-Type": "application/json",
//           },
//           json: {
//             encData,
//             orderId: uuid(),
//             encMode: "A2",
//           },
//           responseType: "json",
//         }
//       );

//       const resultMsg = response.body.resultMsg;

//       // Send response back to the client
//       res.status(200).json({ resultMsg });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Payment registration failed." });
//     }
//   } else {
//     res.setHeader("Allow", ["POST"]);
//     res.status(405).json({ error: "Method not allowed" });
//   }
// }



// // Helper function to handle billing
// export async function billing(bid) {
//   try {
//     const response = await got.post(
//       `https://sandbox-api.nicepay.co.kr/v1/subscribe/${bid}/payments`,
//       {
//         headers: {
//           Authorization:
//             "Basic " + Buffer.from(`${clientId}:${secretKey}`).toString("base64"),
//           "Content-Type": "application/json",
//         },
//         json: {
//           orderId: uuid(),
//           amount: ,
//           goodsName: "card billing test",
//           cardQuota: 0,
//           useShopInterest: false,
//         },
//         responseType: "json",
//       }
//     );
//     console.log(response.body);
//     return response.body
//   } catch (error) {
//     console.error(error);
//     throw new Error("Billing process failed.");
//   }
// }

// // Helper function to handle expiration
// export async function expire(bid) {
//   try {
//     const response = await got.post(
//       `https://sandbox-api.nicepay.co.kr/v1/subscribe/${bid}/expire`,
//       {
//         headers: {
//           Authorization:
//             "Basic " + Buffer.from(`${clientId}:${secretKey}`).toString("base64"),
//           "Content-Type": "application/json",
//         },
//         json: {
//           orderId: uuid(),
//         },
//         responseType: "json",
//       }
//     );
//     console.log(response.body);
//     return response.body;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Subscription expiration failed.");
//   }
// }
