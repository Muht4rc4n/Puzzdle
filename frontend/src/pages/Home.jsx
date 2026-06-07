import React from 'react';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <section id="home-screen" className="screen active">
        <div className="hero-section text-center">
            <h1>Yapboz Şablonunu Seç ve Başla 🧩</h1>
            <p>Arkadaşlarınla sesli sohbet eşliğinde yarış veya tek başına zihnini dinlendir.</p>
        </div>
        
        <div className="templates-grid" id="global-templates-grid">
        </div>
        
        <Footer />
    </section>
  );
};

export default Home;
