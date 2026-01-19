import { Result } from "pg";
import { escape } from "querystring";
import { json } from "stream/consumers";


export async function POST(req: Request) {
    try {


        const body = await req.json();
        const { encoded_code ,judge0_id} = body;
        console.log(judge0_id)
        console.log(encoded_code)


        const res = await fetch("http://135.235.192.49:2358/submissions?base64_encoded=true", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                source_code: encoded_code,
                language_id: judge0_id,

            }),


        });
        const {token} = await res.json();





        let result;
        while (true) {
            const resultRes = await fetch(
                `http://135.235.192.49:2358/submissions/${token}?base64_encoded=true`
            );

            result = await resultRes.json();

            if (result.status?.id > 2) break; // finished

            await new Promise((r) => setTimeout(r, 1000)); // wait 1 sec
        }


        return Response.json(result, { status: 200 });






    } catch (error) {
        console.log(error);
        return Response.json(
            {
                error: "Failed"
            },
            { status: 500 }
        );
    }



}