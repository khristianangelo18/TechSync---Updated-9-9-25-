import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeStep, setActiveStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const steps = [
    {
      number: "1",
      title: "AI-Powered Skill Matching",
      description: "Our intelligent algorithm analyzes your technical skills, expertise, and accurately assign you to optimized teams for maximum collaboration efficiency.",
      extendedContent: "TechSync's advanced AI evaluates your coding proficiency, project experience, and collaboration preferences to create the perfect team match. No more mismatched skill levels or incompatible working styles - just seamless collaboration with developers who complement your expertise and share your project vision.",
      features: ["Technical Skill Analysis", "Role-Based Matching", "Collaboration Optimization", "Team Chemistry Assessment"]
    },
    {
      number: "2", 
      title: "Guided Learning Pathways",
      description: "Automated progress tracking and personalized learning resources for developers who need to improve their skills before joining teams.",
      extendedContent: "Failed a coding challenge? Our system doesn't just reject you - it guides you forward. Get personalized learning recommendations, skill-building resources, and clear improvement milestones based on your current level. Track your progress and receive automated feedback until you're ready to join your ideal team.",
      features: ["Automated Progress Tracking", "Personalized Resources", "Skill Gap Analysis", "Milestone Achievements"]
    },
    {
      number: "3",
      title: "Solo Development Projects", 
      description: "Access tailored project ideas and collaborative tools even when working independently, using our skill-matching system for personalized recommendations.",
      extendedContent: "Not ready for team collaboration yet? Our solo pathway generates project ideas perfectly matched to your current qualifications and growth goals. Work independently while still accessing our collaboration tools, progress tracking, and community features - building your skills at your own pace.",
      features: ["Skill-Based Project Generation", "Independent Development", "Progress Tracking", "Collaboration Tools Access"]
    },
    {
      number: "4",
      title: "Continuous Growth & Accountability",
      description: "Comprehensive tracking system that ensures developer accountability while providing ongoing support for skill development and career advancement.",
      extendedContent: "TechSync doesn't just connect you once - we support your entire developer journey. Our accountability system tracks your contributions, measures your growth, and provides continuous feedback. Whether you're in a team or working solo, we ensure you're always progressing toward your career goals.",
      features: ["Performance Analytics", "Accountability Metrics", "Career Progression", "Continuous Support"]
    }
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-advance steps every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        handleStepChange((prev) => (prev + 1) % steps.length);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isTransitioning]);

  const handleStepChange = (newStepOrFunction) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const newStep = typeof newStepOrFunction === 'function' 
      ? newStepOrFunction(activeStep) 
      : newStepOrFunction;
    
    // Immediate step change for proper card drawing effect
    setActiveStep(newStep);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/login?mode=signup')
    window.scrollTo(0, 0);
  };

  const handleConnectClick = () => {
    navigate('/login?mode=signup');
  };

  const handleExploreClick = () => {
    document.getElementById('our-initiative')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>
        {`
          /* Navigation hover animations */
          .nav-link:hover {
            color: #1f2937 !important;
            transform: translateY(-2px);
          }
          
          .login-btn:hover {
            color: #ffffff !important;
            transform: translateY(-2px);
          }
          
          .signup-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .cta-primary:hover {
            background: #2d3035 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(26, 28, 32, 0.3);
          }
          
          .cta-secondary:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
            transform: translateY(-2px);
          }
          
          .final-cta-primary:hover {
            background: #2d3035 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(26, 28, 32, 0.3);
          }
          
          .final-cta-secondary:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
            transform: translateY(-2px);
          }
          
          .feature-tag:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-2px);
          }
          
          .progress-dot:hover {
            transform: scale(1.1) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
          }

          /* Card drawing animation system like dealing cards */
          .card-container {
            position: relative;
            perspective: 1200px;
            transform-style: preserve-3d;
            overflow: visible;
          }

          /* Card drawing animations - all cards slide in from different directions */
          @keyframes drawMainCard {
            0% {
              opacity: 0;
              transform: translateX(200px) translateY(-50px) scale(0.7) rotateY(15deg);
            }
            60% {
              opacity: 0.8;
              transform: translateX(50px) translateY(-10px) scale(0.9) rotateY(5deg);
            }
            100% {
              opacity: 1;
              transform: translateX(0) translateY(0) scale(1) rotateY(0deg);
            }
          }

          @keyframes drawLeftCard {
            0% {
              opacity: 0;
              transform: translateY(-50%) translateX(-150px) scale(0.5) rotateY(-45deg);
            }
            100% {
              opacity: 0.3;
              transform: translateY(-50%) translateX(0) scale(0.75) rotateY(-25deg);
            }
          }

          @keyframes drawRightCard {
            0% {
              opacity: 0;
              transform: translateY(-50%) translateX(150px) scale(0.5) rotateY(45deg);
            }
            100% {
              opacity: 0.3;
              transform: translateY(-50%) translateX(0) scale(0.75) rotateY(25deg);
            }
          }

          /* Card animation classes */
          .main-card {
            will-change: transform, opacity;
          }

          .main-card.draw-in {
            animation: drawMainCard 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }

          .side-card {
            will-change: transform, opacity;
          }

          .side-card.draw-left {
            animation: drawLeftCard 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            animation-delay: 0.1s;
          }

          .side-card.draw-right {
            animation: drawRightCard 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            animation-delay: 0.2s;
          }

          /* Content cascade within cards */
          .content-cascade {
            opacity: 1;
            transform: translateY(0);
            transition: all 0.3s ease;
          }

          .content-cascade.hide {
            opacity: 0;
            transform: translateY(15px);
          }

          .content-cascade.show {
            animation: contentFadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }

          @keyframes contentFadeInUp {
            0% {
              opacity: 0;
              transform: translateY(15px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Stagger delays for content cascade */
          .cascade-delay-1 { animation-delay: 0.4s; }
          .cascade-delay-2 { animation-delay: 0.5s; }
          .cascade-delay-3 { animation-delay: 0.6s; }
          .cascade-delay-4 { animation-delay: 0.7s; }
          .cascade-delay-5 { animation-delay: 0.8s; }
          .cascade-delay-6 { animation-delay: 0.9s; }
          .cascade-delay-7 { animation-delay: 1.0s; }
          .cascade-delay-8 { animation-delay: 1.1s; }
        `}
      </style>
      
      {/* Background Elements */}
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
        viewBox="0 0 1440 1024"
        preserveAspectRatio="none"
      >
        <path
          d="M0,400 Q200,300 400,350 T800,320 Q1000,280 1200,340 L1440,360 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          opacity={0.02}
        />
        <path
          d="M0,600 Q300,500 600,550 T1200,520 L1440,540 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          opacity={0.015}
        />
        <path
          d="M0,200 Q400,100 800,150 Q1000,120 1440,180 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          opacity={0.01}
        />
      </svg>

      {/* Code symbols background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          {/* Additional symbols */}
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
          }}>&#60;/&#62;</div>
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, background: 'transparent', zIndex: 2 }} />

      {/* Mouse follow effect */}
      <div 
        style={{
          position: 'fixed',
          width: '384px',
          height: '384px',
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0.1,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          zIndex: 3,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192
        }}
      />

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            borderRadius: '4px',
            transform: 'rotate(45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              background: 'white',
              borderRadius: '2px',
              transform: 'rotate(-45deg)'
            }} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            letterSpacing: '-0.025em'
          }}>TechSync</span>
        </div>

        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          background: 'white',
          backdropFilter: 'blur(8px)',
          borderRadius: '0 0 20px 20px',
          padding: '0.75rem 1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <span 
            onClick={() => navigate('/')} 
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.3s ease, transform 0.3s ease',
              cursor: 'pointer'
            }} 
            className="nav-link"
          >
            HOME
          </span>
          
          <span 
            onClick={() => navigate('/features')} 
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.3s ease, transform 0.3s ease',
              cursor: 'pointer'
            }} 
            className="nav-link"
          >
            FEATURES
          </span>

          <span 
            onClick={() => navigate('/aboutpage')} 
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.3s ease, transform 0.3s ease',
              cursor: 'pointer'
            }} 
            className="nav-link"
          >
            ABOUT
          </span>

          <span 
            onClick={() => navigate('/developerspage')} 
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.3s ease, transform 0.3s ease',
              cursor: 'pointer'
            }} 
            className="nav-link"
          >
            DEVELOPERS
          </span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{
            color: '#d1d5db',
            background: 'none',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'color 0.3s ease, transform 0.3s ease',
            padding: '0.5rem 1rem',
            fontSize: '16px'
          }} className="login-btn" onClick={handleLoginClick}>
            Login
          </button>
          <button style={{
            background: 'linear-gradient(to right, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '9999px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '16px'
          }} className="signup-btn" onClick={handleSignUpClick}>
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '0 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            lineHeight: 1.1,
            margin: '0 0 1rem 0'
          }}>
            Code with <span style={{
              background: 'linear-gradient(to right, #60a5fa, #a855f7, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>PURPOSE</span>, Learn with <span style={{
              background: 'linear-gradient(to right, #a78bfa, #ec4899, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>PRECISION</span>
          </h1>
          <div style={{
            fontSize: '2rem',
            fontFamily: 'Courier New, monospace',
            color: '#9ca3af',
            margin: '1rem 0 2rem 0'
          }}>&lt;techsync/&gt;</div>
          
          <p style={{
            fontSize: '1.5rem',
            color: '#d1d5db',
            margin: '0 0 3rem 0',
            lineHeight: 1.6
          }}>
            No more random teammates. Just real growth, real projects, and the right people.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem'
          }}>
            <button style={{
              background: '#1A1C20',
              color: 'white',
              border: 'none',
              padding: '1rem 3rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} className="cta-primary" onClick={handleConnectClick}>
              Connect
            </button>
            <button style={{
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'transparent',
              color: 'white',
              padding: '1rem 3rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)'
            }} className="cta-secondary" onClick={handleExploreClick}>
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* Our Initiative Section - ENHANCED CASCADE CAROUSEL */}
      <section id="our-initiative" style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <svg 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0
            }}
            viewBox="0 0 1440 1024"
            preserveAspectRatio="none"
          >
            <path
              d="M0,300 Q250,200 500,250 T1000,220 L1440,240 L1440,1024 L0,1024 Z"
              fill="rgba(255,255,255,0.02)"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              opacity={0.015}
            />
            <path
              d="M0,500 Q350,400 700,450 T1440,420 L1440,1024 L0,1024 Z"
              fill="rgba(255,255,255,0.02)"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              opacity={0.01}
            />
          </svg>
        </div>
        
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          padding: '4rem 0',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '4rem',
            color: 'white',
            letterSpacing: '0.1em'
          }}>OUR INITIATIVE</h2>
          
          {/* ENHANCED CASCADE CAROUSEL */}
          <div className="card-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            maxWidth: '1400px',
            margin: '0 auto 2rem auto',
            padding: '0 2rem',
            minHeight: '420px',
            position: 'relative',
            perspective: '1200px'
          }}>
            
            {/* LEFT CARD - DRAWS IN FROM LEFT */}
            <div
              key={`left-card-${activeStep}`}
              className={`side-card ${isTransitioning ? 'draw-left' : ''}`}
              style={{
                position: 'absolute',
                left: '12%',
                top: '50%',
                transform: 'translateY(-50%) scale(0.75) rotateY(-25deg)',
                opacity: isTransitioning ? 0 : 0.3,
                cursor: 'pointer',
                zIndex: 1,
                width: '220px',
                height: '380px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                pointerEvents: isTransitioning ? 'none' : 'auto'
              }}
              onClick={() => {
                if (!isTransitioning) {
                  handleStepChange(activeStep === 0 ? steps.length - 1 : activeStep - 1);
                }
              }}
              onMouseEnter={(e) => {
                if (!isTransitioning) {
                  e.currentTarget.style.opacity = '0.5';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(0.8) rotateY(-15deg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isTransitioning) {
                  e.currentTarget.style.opacity = '0.3';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(0.75) rotateY(-25deg)';
                }
              }}
            >
              <div style={{
                fontSize: '5rem',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.1)',
                lineHeight: 1,
                marginBottom: '1rem'
              }}>
                {steps[activeStep === 0 ? steps.length - 1 : activeStep - 1].number}
              </div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                opacity: 0.8
              }}>
                {steps[activeStep === 0 ? steps.length - 1 : activeStep - 1].title}
              </h3>
            </div>

            {/* CENTER CARD - MAIN DRAWING CARD */}
            <div 
              key={`main-card-${activeStep}`}
              className={`main-card ${isTransitioning ? 'draw-in' : ''}`}
              style={{
                position: 'relative',
                zIndex: 3,
                width: '380px',
                height: '400px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '25px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                opacity: isTransitioning ? 0 : 1,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                overflow: 'visible'
              }}
            >
              {/* BACKGROUND NUMBER - ALWAYS CENTERED */}
              <div 
                style={{
                  fontSize: '7rem',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.06)',
                  lineHeight: 1,
                  position: 'absolute',
                  top: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1,
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
                className={isTransitioning ? 'show cascade-delay-1' : ''}
              >
                {steps[activeStep].number}
              </div>
              
              {/* CONTENT WITH CASCADES */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                paddingTop: '1.5rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                width: '100%'
              }}>
                <h3 
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '0.8rem',
                    background: 'linear-gradient(135deg, #ffffff, #e5e7eb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    position: 'relative',
                    zIndex: 3,
                    marginTop: '2rem'
                  }}
                  className={`content-cascade ${isTransitioning ? 'show cascade-delay-2' : ''}`}
                >
                  {steps[activeStep].title}
                </h3>
                
                <p 
                  style={{
                    color: '#d1d5db',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    marginBottom: '0.8rem'
                  }}
                  className={`content-cascade ${isTransitioning ? 'show cascade-delay-3' : ''}`}
                >
                  {steps[activeStep].description}
                </p>
                
                <p 
                  style={{
                    color: '#9ca3af',
                    fontSize: '0.7rem',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    fontStyle: 'italic'
                  }}
                  className={`content-cascade ${isTransitioning ? 'show cascade-delay-4' : ''}`}
                >
                  {steps[activeStep].extendedContent}
                </p>
                
                {/* FEATURE TAGS */}
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    width: '100%',
                    marginTop: 'auto'
                  }}
                >
                  {steps[activeStep].features.map((feature, index) => (
                    <div 
                      key={`feature-${index}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '0.4rem 0.5rem',
                        color: '#e5e7eb',
                        fontSize: '0.65rem',
                        fontWeight: '500',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        whiteSpace: 'normal',
                        lineHeight: 1.3,
                        transition: 'all 0.3s ease'
                      }} 
                      className={`content-cascade feature-tag ${isTransitioning ? `show cascade-delay-${5 + index}` : ''}`}
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT CARD - DRAWS IN FROM RIGHT */}
            <div
              key={`right-card-${activeStep}`}
              className={`side-card ${isTransitioning ? 'draw-right' : ''}`}
              style={{
                position: 'absolute',
                right: '12%',
                top: '50%',
                transform: 'translateY(-50%) scale(0.75) rotateY(25deg)',
                opacity: isTransitioning ? 0 : 0.3,
                cursor: 'pointer',
                zIndex: 1,
                width: '220px',
                height: '380px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                pointerEvents: isTransitioning ? 'none' : 'auto'
              }}
              onClick={() => {
                if (!isTransitioning) {
                  handleStepChange((activeStep + 1) % steps.length);
                }
              }}
              onMouseEnter={(e) => {
                if (!isTransitioning) {
                  e.currentTarget.style.opacity = '0.5';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(0.8) rotateY(15deg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isTransitioning) {
                  e.currentTarget.style.opacity = '0.3';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(0.75) rotateY(25deg)';
                }
              }}
            >
              <div style={{
                fontSize: '5rem',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.1)',
                lineHeight: 1,
                marginBottom: '1rem'
              }}>
                {steps[(activeStep + 1) % steps.length].number}
              </div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                opacity: 0.8
              }}>
                {steps[(activeStep + 1) % steps.length].title}
              </h3>
            </div>
          </div>

          {/* Progress Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.6rem',
            marginTop: '2rem'
          }}>
            {steps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: index === activeStep ? '#374151' : 'transparent',
                  borderColor: index === activeStep ? '#6b7280' : 'rgba(255, 255, 255, 0.2)',
                  transform: index === activeStep ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: index === activeStep ? '0 0 20px rgba(107, 114, 128, 0.4)' : 'none',
                  pointerEvents: isTransitioning ? 'none' : 'auto'
                }}
                className="progress-dot"
                onClick={() => {
                  if (!isTransitioning) {
                    handleStepChange(index);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        position: 'relative',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '3rem',
            color: 'white',
            lineHeight: 1.2
          }}>Ready to Connect? Join Everyone!</h2>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem'
          }}>
            <button style={{
              background: '#1A1C20',
              color: 'white',
              border: 'none',
              padding: '1rem 3rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} className="final-cta-primary" onClick={handleConnectClick}>
              Connect
            </button>
            <button style={{
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'transparent',
              color: 'white',
              padding: '1rem 3rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)'
            }} className="final-cta-secondary" onClick={handleExploreClick}>
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'transparent',
        borderTop: 'none',
        paddingTop: 0
      }}>
        <div style={{
          padding: '1rem 2rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          marginTop: '2rem'
        }}>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            margin: 0
          }}>© 2025 TechSync. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;