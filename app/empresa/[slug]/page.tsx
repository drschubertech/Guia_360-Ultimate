import { empresasMock } from '../../../lib/data';
import { notFound } from 'next/navigation';
import { MapPin, Star, Phone, Globe, Clock } from 'lucide-react';

export default function PerfilEmpresa({ params }: { params: { slug: string } }) {
  const empresa = empresasMock.find(e => e.slug === params.slug);

  if (!empresa) {
    notFound();
  }

  return (
    <main style={{ backgroundColor: 'var(--bg-offwhite)', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Capa */}
      <div style={{ height: '300px', backgroundColor: '#333', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={empresa.capa} alt={empresa.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
      </div>

      <div className="container" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        <div style={{ backgroundColor: 'var(--bg-light)', padding: '40px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '5px' }}>
                {empresa.categoria}
              </div>
              <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{empresa.nome}</h1>
              <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f39c12', fontWeight: 'bold' }}>
                  <Star size={16} fill="currentColor" /> {empresa.avaliacao} (120 avaliações)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={16} /> {empresa.endereco}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ 
                padding: '8px 15px', 
                backgroundColor: empresa.status === 'aberto' ? 'var(--primary-color)' : '#e74c3c', 
                color: '#fff', 
                fontWeight: 'bold', 
                borderRadius: 'var(--radius-pill)',
                textTransform: 'uppercase',
                fontSize: '0.8rem'
              }}>
                {empresa.status === 'aberto' ? 'Aberto Agora' : 'Fechado'}
              </div>
              <button className="btn-theme" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} /> Contatar via WhatsApp
              </button>
            </div>
          </div>

          <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
            {/* Esquerda: Sobre */}
            <div>
              <h3 style={{ marginBottom: '15px' }}>Sobre o Negócio</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '30px' }}>
                {empresa.descricao}
                <br /><br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              
              <h3 style={{ marginBottom: '15px' }}>Tags</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {empresa.tags.map(tag => (
                  <span key={tag} style={{ backgroundColor: '#f0f0f0', padding: '5px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Direita: Info Prática */}
            <div style={{ backgroundColor: '#f9f9f9', padding: '25px', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ marginBottom: '20px' }}>Informações</h3>
              
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} style={{ color: 'var(--primary-color)' }} />
                  {empresa.telefone}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe size={18} style={{ color: 'var(--primary-color)' }} />
                  <a href="#">www.site-exemplo.com.br</a>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Clock size={18} style={{ color: 'var(--primary-color)', marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Horário de Funcionamento:</strong><br />
                    Seg - Sex: 08:00 às 18:00<br />
                    Sáb: 08:00 às 12:00
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
