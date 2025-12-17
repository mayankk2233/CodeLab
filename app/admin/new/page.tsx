import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema
const createSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
});

export default async function NewProblemPage() {
  // Check authentication
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/');
  }

  async function create(formData: FormData) {
    "use server";

    try {
      // Validate input
      const validated = createSchema.parse({
        title: formData.get("title"),
        slug: formData.get("slug"),
        difficulty: formData.get("difficulty"),
        description: formData.get("description"),
      });

      // Check if slug already exists
      const existing = await prisma.problem.findUnique({
        where: { slug: validated.slug }
      });

      if (existing) {
        throw new Error('A problem with this slug already exists');
      }

      await prisma.problem.create({
        data: {
          ...validated,
          examples: [],
          tags: []
        }
      });

      revalidatePath('/admin');
      revalidatePath('/problems');

    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[VALIDATION_ERROR]', error.errors);
        throw new Error(error.errors[0].message);
      }

      console.error('[CREATE_ERROR]', error);
      throw error;
    }

    redirect("/admin");
  }

  return (
    <form action={create} className="grid gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        New Problem
      </h1>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Title
        </label>
        <input
          name="title"
          required
          minLength={3}
          maxLength={200}
          placeholder="e.g., Two Sum"
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Slug (URL-friendly)
        </label>
        <input
          name="slug"
          required
          minLength={3}
          maxLength={100}
          pattern="[a-z0-9-]+"
          placeholder="e.g., two-sum"
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Use lowercase letters, numbers, and hyphens only
        </p>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Difficulty
        </label>
        <select
          name="difficulty"
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
          required
          minLength={10}
          maxLength={5000}
          placeholder="Describe the problem..."
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <button
        type="submit"
        className="btn border-neutral-300 dark:border-neutral-700 w-fit px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
      >
        Create Problem
      </button>
    </form>
  );
}
