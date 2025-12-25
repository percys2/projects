"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  HelpCircle, 
  X, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Rocket,
  ShoppingCart,
  Package,
  Receipt,
  Wallet,
  Users,
  UserCheck,
  Settings,
  BookOpen
} from "lucide-react";

const iconMap = {
  "rocket": Rocket,
  "shopping-cart": ShoppingCart,
  "package": Package,
  "receipt": Receipt,
  "wallet": Wallet,
  "users": Users,
  "user-check": UserCheck,
  "settings": Settings,
  "help-circle": HelpCircle,
};

export default function HelpCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryArticles, setCategoryArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/help?action=categories");
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Error loading help categories:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadCategories();
    }
  }, [isOpen, categories.length, loadCategories]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/help?action=search&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("Error searching help:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryArticles = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const res = await fetch(`/api/help?action=category&category=${category.id}`);
      const data = await res.json();
      setCategoryArticles(data.articles || []);
    } catch (err) {
      console.error("Error loading category articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadArticle = async (articleId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/help?action=article&id=${articleId}`);
      const data = await res.json();
      setSelectedArticle(data.article);
    } catch (err) {
      console.error("Error loading article:", err);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setCategoryArticles([]);
    }
  };

  const resetView = () => {
    setSelectedArticle(null);
    setSelectedCategory(null);
    setCategoryArticles([]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-8 text-center text-slate-500">
          Cargando...
        </div>
      );
    }

    if (selectedArticle) {
      return (
        <div className="p-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {selectedArticle.title}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            {selectedArticle.summary}
          </p>
          <div 
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ 
              __html: selectedArticle.content
                .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
                .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-3 mb-2">$1</h2>')
                .replace(/^### (.*$)/gm, '<h3 class="text-base font-medium mt-2 mb-1">$1</h3>')
                .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '<br/><br/>')
            }}
          />
        </div>
      );
    }

    if (selectedCategory) {
      return (
        <div className="p-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            {selectedCategory.name}
          </h2>
          <div className="space-y-2">
            {categoryArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => loadArticle(article.id)}
                className="w-full text-left p-3 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <p className="font-medium text-slate-800">{article.title}</p>
                <p className="text-sm text-slate-500">{article.summary}</p>
              </button>
            ))}
            {categoryArticles.length === 0 && (
              <p className="text-slate-500 text-center py-4">
                No hay articulos en esta categoria
              </p>
            )}
          </div>
        </div>
      );
    }

    if (searchQuery.length >= 2) {
      return (
        <div className="p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-3">
            Resultados para "{searchQuery}"
          </h3>
          <div className="space-y-2">
            {searchResults.map((article) => (
              <button
                key={article.id}
                onClick={() => loadArticle(article.id)}
                className="w-full text-left p-3 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <p className="font-medium text-slate-800">{article.title}</p>
                <p className="text-sm text-slate-500">{article.summary}</p>
              </button>
            ))}
            {searchResults.length === 0 && (
              <p className="text-slate-500 text-center py-4">
                No se encontraron resultados
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        <h3 className="text-sm font-medium text-slate-600 mb-3">
          Categorias de Ayuda
        </h3>
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || BookOpen;
            return (
              <button
                key={category.id}
                onClick={() => loadCategoryArticles(category)}
                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {category.articleCount} articulo{category.articleCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-40"
        title="Centro de Ayuda"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => {
              setIsOpen(false);
              resetView();
            }}
          />

          <div className="fixed bottom-24 right-6 w-96 max-h-[70vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-600 text-white">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <h2 className="font-semibold">Centro de Ayuda</h2>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetView();
                }}
                className="p-1 hover:bg-blue-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar ayuda..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {renderContent()}
            </div>

            <div className="px-4 py-3 border-t bg-slate-50 text-center">
              <p className="text-xs text-slate-500">
                ¿Necesitas mas ayuda? Contacta a{" "}
                <a href="mailto:soporte@agrocentro.com" className="text-blue-600 hover:underline">
                  soporte@agrocentro.com
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}