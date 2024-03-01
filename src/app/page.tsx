import contentTest from "@/utils/contents";
import { openai } from "@/utils/openai";
import { createClient } from "@/utils/supabase/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  async function main(input: string[]) {
    const data = await Promise.all(
      input.map(async (textChunk) => {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: textChunk,
        });
        return {
          content: textChunk,
          embedding: embeddingResponse.data[0].embedding,
        };
      })
    );

    await supabase.from("documents").insert(data);
  }

  main(contentTest);

  // Create a new row in the "posts" table
  async function create(fd: FormData) {
    "use server";
    const supabase = createServerActionClient({ cookies });

    const text = fd.get("text");
    const { data, error } = await supabase.from("todos").insert({ text });
  }

  return (
    <form action={create}>
      <label htmlFor="text">
        TEXT
        <input type="text" name="text" />
      </label>
      <button type="submit">add</button>
    </form>
  );
}
