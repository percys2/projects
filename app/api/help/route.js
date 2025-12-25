import { NextResponse } from "next/server";
import { 
  searchHelp, 
  getCategories, 
  getArticlesByCategory, 
  getArticleById 
} from "@/src/lib/help/helpContent";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "categories";

    switch (action) {
      case "categories": {
        const categories = getCategories();
        return NextResponse.json({ success: true, categories });
      }

      case "search": {
        const query = searchParams.get("q") || "";
        const results = searchHelp(query);
        return NextResponse.json({ success: true, results });
      }

      case "category": {
        const categoryId = searchParams.get("category");
        if (!categoryId) {
          return NextResponse.json({ error: "Category ID required" }, { status: 400 });
        }
        const articles = getArticlesByCategory(categoryId);
        return NextResponse.json({ success: true, articles });
      }

      case "article": {
        const articleId = searchParams.get("id");
        if (!articleId) {
          return NextResponse.json({ error: "Article ID required" }, { status: 400 });
        }
        const article = getArticleById(articleId);
        if (!article) {
          return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, article });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Help API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
