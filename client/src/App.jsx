import { useState, useEffect, useRef } from 'react';
import { improvePrompt } from './api';

function App() {
    const [idea, setIdea] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const prevIdeaRef = useRef('');

    // Example ideas to try
    const examples = [
        'a website for a mobile car wash in Cairo',
        'an online store selling handmade jewelry',
        'a SaaS platform for project management',
        'a restaurant website with online ordering',
        'a fitness studio with class bookings',
        'a travel agency booking website',
        'a wedding photography portfolio',
        'a consulting firm website',
        'a non-profit donation platform',
        'a pet grooming salon booking site'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!idea.trim() || idea.trim().length < 10) {
            setError('Please enter at least 10 characters');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setCopied(false);

        try {
            const data = await improvePrompt(idea.trim());
            setResult(data);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result?.improvedPrompt) return;

        try {
            await navigator.clipboard.writeText(result.improvedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const useExample = (exampleText) => {
        if (result) {
            setIsExiting(true);
            setTimeout(() => {
                setResult(null);
                setIsExiting(false);
            }, 300);
        }
        setIdea(exampleText);
        setError(null);
    };

    // Clear result when user types new input (but not on initial render)
    useEffect(() => {
        if (result && prevIdeaRef.current !== '' && idea !== prevIdeaRef.current) {
            setIsExiting(true);
            setTimeout(() => {
                setResult(null);
                setIsExiting(false);
            }, 300);
        }
        prevIdeaRef.current = idea;
    }, [idea]);

    return (
        <div className="app">
            {/* Animated Background */}
            <div className="animated-background">
                <div className="bg-shape shape-1"></div>
                <div className="bg-shape shape-2"></div>
                <div className="bg-shape shape-3"></div>
                <div className="bg-shape shape-4"></div>
            </div>

            <div className="container">
                {/* Hero Section */}
                <header className="hero">
                    <h1 className="hero-title">Website Prompt Improver</h1>
                    <p className="hero-subtitle">Transform your idea into a structured build prompt</p>
                    <div className="hero-benefits">
                        <span className="benefit-item">✓ SEO-ready</span>
                        <span className="benefit-item">✓ Copy-paste ready</span>
                        <span className="benefit-item">✓ Structured output</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="main-content">
                    <div className="content-layout">
                        {/* Left Side - Animated Visual */}
                        <div className="visual-side">
                            <div className="animated-icon">
                                <div className="icon-circle circle-1"></div>
                                <div className="icon-circle circle-2"></div>
                                <div className="icon-circle circle-3"></div>
                                <div className="icon-center">
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                        <path d="M2 17l10 5 10-5"></path>
                                        <path d="M2 12l10 5 10-5"></path>
                                    </svg>
                                </div>
                            </div>
                            <div className="visual-text">
                                <h3>Transform Ideas</h3>
                                <p>Turn rough concepts into polished prompts</p>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="form-side">
                            <form onSubmit={handleSubmit} className="improve-form">
                                <div className="form-header">
                                    <h2>Enter Your Idea</h2>
                                </div>
                                <textarea
                                    id="idea"
                                    className="form-textarea"
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                    placeholder="Describe your website idea here..."
                                    rows="5"
                                    disabled={loading}
                                />
                                <div className="form-footer">
                                    <span className="char-count">{idea.length} / 1000</span>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={loading || !idea.trim() || idea.trim().length < 10}
                                    >
                                        {loading ? 'Improving...' : '✨ Improve Prompt'}
                                    </button>
                                </div>
                            </form>

                            {/* Error Message */}
                            {error && (
                                <div className="error-message animate-in">
                                    <strong>Error:</strong> {error}
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="loading-state animate-in">
                                    <div className="spinner"></div>
                                    <span>Processing your idea...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Examples - Full Width */}
                    <div className="examples">
                        <span className="examples-label">Try examples: </span>
                        {examples.slice(0, 6).map((example, index) => (
                            <button
                                key={index}
                                type="button"
                                className="example-btn"
                                onClick={() => useExample(example)}
                                disabled={loading}
                            >
                                {example}
                            </button>
                        ))}
                    </div>

                    {/* Result Panel - Creative Display */}
                    {result && !loading && (
                        <div className={`result-panel ${isExiting ? 'slide-up' : 'result-appear'}`}>
                            <div className="result-header">
                                <div className="result-title-section">
                                    <span className="result-icon">✨</span>
                                    <span className="result-title">Your Improved Prompt</span>
                                </div>
                                {result.meta && (
                                    <div className="result-meta">
                                        <span className="meta-badge" style={{ animationDelay: '0.1s' }}>{result.meta.detectedIndustry}</span>
                                        <span className="meta-badge" style={{ animationDelay: '0.2s' }}>{result.meta.detectedAudience}</span>
                                    </div>
                                )}
                                <button
                                    onClick={handleCopy}
                                    className="btn-copy"
                                    title="Copy to clipboard"
                                >
                                    {copied ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <div className="result-content-wrapper">
                                <pre className="result-content">{result.improvedPrompt}</pre>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;

