'use client';

import Link from 'next/link';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <div className="adm-header-bar">
      <style>{`
        .adm-header-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
        }

        .adm-header-title {
          font-family: var(--font-outfit), Georgia, serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #1E293B;
          margin: 0;
          line-height: 1.2;
        }

        .adm-header-sub {
          font-size: 0.9rem;
          color: #64748B;
          margin-top: 4px;
        }

        .adm-header-link {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #2563EB;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          padding-top: 6px;
          transition: opacity 0.15s ease;
        }

        .adm-header-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
      `}</style>
      <div>
        <h1 className="adm-header-title">{title}</h1>
        <p className="adm-header-sub">{subtitle}</p>
      </div>

      <Link href="/" target="_blank" className="adm-header-link">
        + VER O PORTAL
      </Link>
    </div>
  );
}
