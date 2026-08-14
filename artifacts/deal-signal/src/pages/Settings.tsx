import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { motion } from 'framer-motion';
import { Bell, Key, Users, Shield } from 'lucide-react';

export default function Settings() {
  const sections = [
    {
      id: 'notifications',
      title: 'Notification Preferences',
      description: 'Configure how you receive alerts for material signals.',
      icon: Bell,
    },
    {
      id: 'team',
      title: 'Team Members',
      description: 'Manage access and role-based permissions for your deal team.',
      icon: Users,
    },
    {
      id: 'api',
      title: 'API Configuration',
      description: 'Manage webhook endpoints and API keys for external integrations.',
      icon: Key,
    },
    {
      id: 'retention',
      title: 'Data Retention',
      description: 'Configure compliance and auto-archival policies for ingested documents.',
      icon: Shield,
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your Watchtower instance"
      />

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={section.id}
            className="bg-card border border-border rounded-xl p-6 flex items-start space-x-5 hover:border-muted-foreground/30 transition-colors cursor-pointer group"
          >
            <div className="bg-sidebar border border-sidebar-border p-3 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
              <section.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-foreground mb-1">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
            <div className="flex items-center self-center">
              <button className="text-sm font-medium text-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Configure &rarr;
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
