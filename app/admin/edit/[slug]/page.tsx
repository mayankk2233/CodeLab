import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditProblemPage({ params }:{ params:{ slug:string } }) {
  const problem = await prisma.problem.findUnique({ where: { slug: params.slug } });
  if (!problem) return <div>Not found</div>;

  async function update(formData: FormData) {
    "use server";
    const title = String(formData.get("title") || "");
    const difficulty = String(formData.get("difficulty") || "EASY") as any;
    const description = String(formData.get("description") || "");
    await prisma.problem.update({
      where: { slug: params.slug },
      data: { title, difficulty, description }
    });
    redirect("/admin");
  }

  return (
    <form action={update} className="grid gap-3 max-w-2xl">
      <h1 className="text-2xl font-semibold">Edit Problem</h1>
      <div>
        <label>Title</label>
        <input name="title" defaultValue={problem.title}/>
      </div>
      <div>
        <label>Difficulty</label>
        <select name="difficulty" defaultValue={problem.difficulty}>
          <option value="EASY">EASY</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HARD">HARD</option>
        </select>
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" rows={6} defaultValue={problem.description}/>
      </div>
      <button className="btn border-neutral-300 w-fit">Save</button>
    </form>
  );
}
