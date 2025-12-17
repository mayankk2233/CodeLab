import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema
const updateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
});

export default async function EditProblemPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  // 1. Await params (Next.js 15+)
  const { slug } = await params;

  // 2. Check authentication
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/');
  }

  // 3. Fetch problem
  const problem = await prisma.problem.findUnique({
    where: { slug }
  });

  if (!problem) {
    notFound();
  }

  // 4. Server action with validation
  async function update(formData: FormData) {
    "use server";

    try {
      // Validate input
      const validated = updateSchema.parse({
        title: formData.get("title"),
        difficulty: formData.get("difficulty"),
        description: formData.get("description"),
      });

      // Update database
      await prisma.problem.update({
        where: { slug },
        data: validated
      });

      // Revalidate cache
      revalidatePath('/admin');
      revalidatePath(`/problems/${slug}`);

    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[VALIDATION_ERROR]', error.errors);
        throw new Error(error.errors[0].message);
      }

      console.error('[UPDATE_ERROR]', error);
      throw new Error('Failed to update problem');
    }

    // Redirect on success
    redirect("/admin");
  }

  return (
    <form action={update} className="grid gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Edit Problem
      </h1>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Title
        </label>
        <input
          name="title"
          defaultValue={problem.title}
          required
          minLength={3}
          maxLength={200}
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Difficulty
        </label>
        <select
          name="difficulty"
          defaultValue={problem.difficulty}
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
        >
          <option value="EASY">EASY</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HARD">HARD</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Description
        </label>
        <textarea
          name="description"
          rows={6}
          defaultValue={problem.description}
          required
          minLength={10}
          maxLength={5000}
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <button
        type="submit"
        className="btn border-neutral-300 dark:border-neutral-700 w-fit px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
      >
        Save Changes
      </button>
    </form>
  );
}
