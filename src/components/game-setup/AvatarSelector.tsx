
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { characterTemplates, CharacterTemplate, archetypeInfo, Archetype } from '@/data/character-templates';
import { CharacterFrame } from './CharacterFrame';
import { CharacterDetailPanel } from './CharacterDetailPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shuffle, Users, Sparkles } from 'lucide-react';
import { staggerContainer, cardVariants } from '@/lib/motion-variants';

interface AvatarSelectorProps {
  onSelect: (template: CharacterTemplate) => void;
  onCustomize: (template: CharacterTemplate) => void;
  onCreateCustom: () => void;
  onBack?: () => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  onSelect,
  onCustomize,
  onCreateCustom,
  onBack
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CharacterTemplate | null>(null);
  const [filterArchetype, setFilterArchetype] = useState<Archetype | 'all'>('all');

  const filteredTemplates = filterArchetype === 'all'
    ? characterTemplates
    : characterTemplates.filter(t => t.archetype === filterArchetype);

  const handleRandomSelect = () => {
    const randomIndex = Math.floor(Math.random() * characterTemplates.length);
    setSelectedTemplate(characterTemplates[randomIndex]);
  };

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  const handleCustomize = () => {
    if (selectedTemplate) {
      onCustomize(selectedTemplate);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-surveillance-pattern opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-br from-bb-blue/[0.03] via-transparent to-bb-gold/[0.03]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial from-bb-blue/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Season 1 Cast Selection</span>
          </motion.div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">
            Choose Your Houseguest
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Select from our diverse cast of characters or create your own custom player
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant={filterArchetype === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterArchetype('all')}
            className="rounded-full"
          >
            All
          </Button>
          {(Object.keys(archetypeInfo) as Archetype[]).map((arch) => (
            <Button
              key={arch}
              variant={filterArchetype === arch ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterArchetype(arch)}
              className={cn(
                'rounded-full',
                filterArchetype === arch && `bg-gradient-to-r ${archetypeInfo[arch].color}`
              )}
            >
              {archetypeInfo[arch].label}
            </Button>
          ))}
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character grid */}
          <motion.div
            className="lg:col-span-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <Card className="p-6 bg-card/50 backdrop-blur border-amber-500/20">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map((template, i) => (
                    <motion.div
                      key={template.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: i * 0.05 }}
                      layout
                    >
                      <CharacterFrame
                        template={template}
                        isSelected={selectedTemplate?.id === template.id}
                        onClick={() => setSelectedTemplate(template)}
                        size="md"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-center gap-3 mt-8 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={handleRandomSelect}
                  className="gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Random Pick
                </Button>
                <Button
                  variant="gradient"
                  onClick={onCreateCustom}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Create Custom Character
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Detail panel */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-card/50 backdrop-blur border-amber-500/20 sticky top-4">
              <CharacterDetailPanel
                template={selectedTemplate}
                onSelect={handleSelect}
                onCustomize={handleCustomize}
              />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
