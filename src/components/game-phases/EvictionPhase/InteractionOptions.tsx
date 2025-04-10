
import React from 'react';
import { Heart, Lightbulb, Users, Star, Shield, Sparkles, Briefcase, Coffee } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { InteractionOption } from './types/interactions';
import InteractionOptionButton from './InteractionOptionButton';

interface InteractionOptionsProps {
  houseguest: Houseguest;
  onSelectOption: (option: InteractionOption) => void;
}

const InteractionOptions: React.FC<InteractionOptionsProps> = ({ 
  houseguest, 
  onSelectOption 
}) => {
  // Generate interaction options based on the houseguest's traits
  const getInteractionOptions = (): InteractionOption[] => {
    // Base options that reference houseguest traits
    const options: InteractionOption[] = [
      {
        id: 'emotional',
        text: `Appeal to ${houseguest.name}'s emotions and share how much you want to stay.`,
        responseText: houseguest.traits.includes('Emotional') 
          ? `${houseguest.name} is moved by your sincerity and shares their own feelings about the game.`
          : `${houseguest.name} seems unmoved by emotional appeals and changes the subject.`,
        relationshipChange: houseguest.traits.includes('Emotional') ? 15 : -5,
        icon: <Heart className="w-4 h-4 mr-2" />,
        requiredSocialStat: 5, // Requires average social skills
        compatibleTraits: ['Emotional', 'Loyal'],
        incompatibleTraits: ['Strategic', 'Analytical']
      },
      {
        id: 'logical',
        text: `Make a strategic case about why keeping you benefits ${houseguest.name}'s game.`,
        responseText: houseguest.traits.includes('Strategic') || houseguest.traits.includes('Analytical')
          ? `${houseguest.name} nods thoughtfully as you lay out your strategic reasoning.`
          : `${houseguest.name} seems skeptical and questions your motives.`,
        relationshipChange: (houseguest.traits.includes('Strategic') || houseguest.traits.includes('Analytical')) ? 15 : -5,
        icon: <Lightbulb className="w-4 h-4 mr-2" />,
        requiredSocialStat: 3, // Requires basic social skills
        compatibleTraits: ['Strategic', 'Analytical'],
        incompatibleTraits: ['Emotional']
      },
      {
        id: 'loyalty',
        text: `Remind ${houseguest.name} of your loyalty and offer future protection.`,
        responseText: houseguest.traits.includes('Loyal') 
          ? `${houseguest.name} values loyalty and appreciates your commitment to work together going forward.`
          : `${houseguest.name} questions your promises and wonders if you're just saying this to stay.`,
        relationshipChange: houseguest.traits.includes('Loyal') ? 15 : -5,
        icon: <Users className="w-4 h-4 mr-2" />,
        requiredSocialStat: 4, // Requires good social skills
        compatibleTraits: ['Loyal', 'Social'],
        incompatibleTraits: ['Sneaky']
      },
      {
        id: 'casual',
        text: `Keep it casual and chat with ${houseguest.name} about life outside the game.`,
        responseText: houseguest.traits.includes('Social')
          ? `${houseguest.name} enjoys the break from game talk and opens up about their personal life.`
          : `${houseguest.name} seems impatient and brings the conversation back to the game.`,
        relationshipChange: houseguest.traits.includes('Social') ? 10 : 0,
        icon: <Coffee className="w-4 h-4 mr-2" />,
        requiredSocialStat: 2, // Requires minimal social skills
        compatibleTraits: ['Social', 'Emotional'],
        incompatibleTraits: ['Strategic']
      }
    ];
    
    // Add trait-specific options if applicable
    if (houseguest.traits.includes('Competitive')) {
      options.push({
        id: 'competitive',
        text: `Challenge ${houseguest.name} to a friendly competition to prove your value in the house.`,
        responseText: `${houseguest.name}'s competitive spirit is sparked. They appreciate your boldness and willingness to prove yourself.`,
        relationshipChange: 20,
        icon: <Star className="w-4 h-4 mr-2" />,
        requiredSocialStat: 6, // Requires good social skills
        compatibleTraits: ['Competitive'],
        incompatibleTraits: ['Analytical']
      });
    }
    
    if (houseguest.traits.includes('Sneaky')) {
      options.push({
        id: 'info',
        text: `Share some "inside information" about another houseguest's strategy.`,
        responseText: `${houseguest.name} leans in with interest, eager to hear what you know about the others.`,
        relationshipChange: 20,
        icon: <Sparkles className="w-4 h-4 mr-2" />,
        requiredSocialStat: 7, // Requires very good social skills
        compatibleTraits: ['Sneaky', 'Strategic'],
        incompatibleTraits: ['Loyal']
      });
    }
    
    if (houseguest.traits.includes('Confrontational')) {
      options.push({
        id: 'direct',
        text: `Be brutally honest about the game state and directly ask for their vote.`,
        responseText: `${houseguest.name} appreciates your straightforward approach. They respect that you didn't try to manipulate them.`,
        relationshipChange: 15,
        icon: <Shield className="w-4 h-4 mr-2" />,
        requiredSocialStat: 4, // Requires average social skills
        compatibleTraits: ['Confrontational'],
        incompatibleTraits: ['Sneaky']
      });
    }

    if (houseguest.traits.includes('Analytical')) {
      options.push({
        id: 'analyze',
        text: `Present a detailed analysis of house dynamics and your role in them.`,
        responseText: `${houseguest.name} is impressed by your thorough understanding of the game and thoughtful analysis.`,
        relationshipChange: 18,
        icon: <Briefcase className="w-4 h-4 mr-2" />,
        requiredSocialStat: 5,
        compatibleTraits: ['Analytical', 'Strategic'],
        incompatibleTraits: ['Emotional']
      });
    }
    
    return options;
  };

  return (
    <div className="space-y-3">
      {getInteractionOptions().map(option => (
        <InteractionOptionButton
          key={option.id}
          option={option}
          onSelect={onSelectOption}
        />
      ))}
    </div>
  );
};

export default InteractionOptions;
