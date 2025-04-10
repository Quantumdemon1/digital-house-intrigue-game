import { BigBrotherGame } from './models/BigBrotherGame';
import { Houseguest, CompetitionType } from './models/houseguest';

export class GameStateBase {
  protected game: BigBrotherGame;
  protected controller: any;
  protected logger: any;

  constructor(game: BigBrotherGame, controller: any) {
    this.game = game;
    this.controller = controller;
    this.logger = controller.logger || console;
  }

  async enter(): Promise<void> {
    this.logger.info(`Entering ${this.constructor.name}`);
    return Promise.resolve();
  }

  async exit(): Promise<void> {
    this.logger.info(`Exiting ${this.constructor.name}`);
    return Promise.resolve();
  }

  async handleAction(actionId: string, params?: any): Promise<boolean> {
    this.logger.info(`Action not implemented in this state: ${actionId}`);
    return Promise.resolve(false);
  }

  async transitionTo(NextStateClass: typeof GameStateBase): Promise<void> {
    await this.exit();
    
    // Create new state
    const newState = new NextStateClass(this.game, this.controller);
    
    // Update game's current state
    this.game.currentState = newState;
    
    // Enter the new state
    await newState.enter();
    
    return Promise.resolve();
  }
}

export class InitializationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.logger.info('Setting up new game');
    
    // Set game phase
    this.game.phase = 'Setup';
    
    // Wait for player to start the game
    // In a React app, this would be triggered by a button click
    
    return Promise.resolve();
  }

  async handleAction(actionId: string, params?: any): Promise<boolean> {
    if (actionId === 'start_game') {
      // Set up the houseguests
      this.game.houseguests = params.houseguests;
      
      // Initialize relationships
      this.game.relationshipSystem.initializeRelationships(this.game.houseguests);
      
      // Log the start of the game
      this.game.logEvent({
        type: 'GAME_START',
        description: 'A new season of Big Brother has begun!',
        involvedHouseguests: this.game.houseguests.map(h => h.id)
      });
      
      // Transition to HoH Competition
      await this.transitionTo(HohCompetitionState);
      return true;
    }
    
    return super.handleAction(actionId, params);
  }
}

export class HohCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    
    // Set game phase
    this.game.phase = 'HoH';
    
    // Reset previous HoH and nominees
    this.game.hohWinner = null;
    this.game.nominees = [];
    
    // Get active houseguests
    const activeHouseguests = this.game.getActiveHouseguests();
    
    // Log the start of HoH competition
    this.game.logEvent({
      type: 'COMPETITION_START',
      description: `Week ${this.game.week} HoH Competition has begun!`,
      involvedHouseguests: activeHouseguests.map(h => h.id)
    });
    
    // If only one player is active, they automatically win
    if (activeHouseguests.length === 1) {
      this.game.hohWinner = activeHouseguests[0];
      
      this.game.logEvent({
        type: 'HOH_WIN',
        description: `${this.game.hohWinner.name} is the only active houseguest and wins HoH by default.`,
        involvedHouseguests: [this.game.hohWinner.id]
      });
      
      // Move to nomination phase
      await this.transitionTo(NominationState);
      return Promise.resolve();
    }
    
    // For player-controlled HoH, wait for them to choose competition type
    const playerHouseguest = activeHouseguests.find(h => h.isPlayer);
    if (playerHouseguest) {
      // Wait for player to choose competition type
      // This would be triggered by UI components
      return Promise.resolve();
    }
    
    // For AI-controlled game, run the competition automatically
    const results = this.game.competitionSystem.simulateHoHCompetition(activeHouseguests);
    
    if (results.length > 0) {
      const winner = results[0].houseguest;
      this.game.hohWinner = winner;
      
      // Update winner's stats
      winner.competitionsWon.hoh++;
      winner.isHoH = true;
      
      this.game.logEvent({
        type: 'HOH_WIN',
        description: `${winner.name} has won Head of Household!`,
        involvedHouseguests: [winner.id]
      });
      
      // Move to nomination phase
      await this.transitionTo(NominationState);
    } else {
      this.logger.error('HoH competition failed to produce a winner');
    }
    
    return Promise.resolve();
  }

  async handleAction(actionId: string, params?: any): Promise<boolean> {
    if (actionId === 'run_hoh_competition') {
      const competitionType = params?.type as CompetitionType || 'Physical';
      const activeHouseguests = this.game.getActiveHouseguests();
      
      // Run the competition with the selected type
      const results = this.game.competitionSystem.runCompetition(
        activeHouseguests,
        competitionType,
        { numberOfWinners: 1 }
      );
      
      if (results.length > 0) {
        const winner = results[0].houseguest;
        this.game.hohWinner = winner;
        
        // Update winner's stats
        winner.competitionsWon.hoh++;
        winner.isHoH = true;
        
        this.game.logEvent({
          type: 'HOH_WIN',
          description: `${winner.name} has won the ${competitionType} Head of Household competition!`,
          involvedHouseguests: [winner.id]
        });
        
        // Move to nomination phase
        await this.transitionTo(NominationState);
        return true;
      } else {
        this.logger.error('HoH competition failed to produce a winner');
        return false;
      }
    }
    
    return super.handleAction(actionId, params);
  }
}

export class NominationState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    
    // Set game phase
    this.game.phase = 'Nomination';
    
    // Log the start of nomination phase
    this.game.logEvent({
      type: 'NOMINATION_PHASE',
      description: `Week ${this.game.week} Nomination Ceremony has begun!`,
      involvedHouseguests: this.game.hohWinner ? [this.game.hohWinner.id] : []
    });
    
    // If HoH is player-controlled, wait for nomination choices
    if (this.game.hohWinner?.isPlayer) {
      // Wait for player to make nominations
      // This would be triggered by UI components
      return Promise.resolve();
    }
    
    // For AI HoH, use AI to choose nominations
    if (this.game.hohWinner && this.game.aiSystem) {
      const hoh = this.game.hohWinner;
      const eligible = this.game.getActiveHouseguests().filter(h => h.id !== hoh.id);
      
      if (eligible.length < 2) {
        this.logger.error('Not enough eligible houseguests for nominations');
        // Move to next phase
        await this.transitionTo(PovCompetitionState);
        return Promise.resolve();
      }
      
      const context = {
        situation: `You are HoH (${hoh.name}). Nominate two different active houseguests for eviction.`,
        eligible: eligible.map(h => h.name),
        botName: hoh.name
      };
      
      try {
        const decision = await this.game.aiSystem.makeDecision(hoh.name, "nomination", context, this.game);
        
        if (decision && decision.nominee1 && decision.nominee2) {
          const nom1 = this.game.houseguests.find(h => h.name === decision.nominee1);
          const nom2 = this.game.houseguests.find(h => h.name === decision.nominee2);
          
          if (nom1 && nom2) {
            // Set nominees
            this.makeNominations(nom1, nom2);
          }
        }
      } catch (error) {
        this.logger.error(`AI nomination error: ${error}`);
        
        // Fall back to random nominations
        const randomNoms = eligible
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
          
        if (randomNoms.length === 2) {
          this.makeNominations(randomNoms[0], randomNoms[1]);
        }
      }
    }
    
    // Move to PoV competition
    await this.transitionTo(PovCompetitionState);
    return Promise.resolve();
  }

  async handleAction(actionId: string, params?: any): Promise<boolean> {
    if (actionId === 'make_nominations') {
      const { nominee1, nominee2 } = params;
      
      // Find the houseguests by name
      const nom1 = this.game.houseguests.find(h => h.name === nominee1);
      const nom2 = this.game.houseguests.find(h => h.name === nominee2);
      
      if (nom1 && nom2) {
        // Make nominations
        this.makeNominations(nom1, nom2);
        
        // Move to PoV competition
        await this.transitionTo(PovCompetitionState);
        return true;
      } else {
        this.logger.error('Invalid nomination choices');
        return false;
      }
    }
    
    return super.handleAction(actionId, params);
  }

  private makeNominations(nominee1: Houseguest, nominee2: Houseguest): void {
    // Set nominees
    this.game.nominees = [nominee1, nominee2];
    
    // Update nominee status
    nominee1.isNominated = true;
    nominee1.nominations++;
    nominee2.isNominated = true;
    nominee2.nominations++;
    
    // Update relationships (nominees will like HoH less)
    if (this.game.hohWinner) {
      const hoh = this.game.hohWinner;
      
      this.game.relationshipSystem.updateRelationships(
        nominee1,
        hoh,
        -20,
        `${nominee1.name} was nominated by ${hoh.name}`
      );
      
      this.game.relationshipSystem.updateRelationships(
        nominee2,
        hoh,
        -20,
        `${nominee2.name} was nominated by ${hoh.name}`
      );
    }
    
    // Log the nominations
    this.game.logEvent({
      type: 'NOMINATION',
      description: `${nominee1.name} and ${nominee2.name} have been nominated for eviction.`,
      involvedHouseguests: [nominee1.id, nominee2.id, this.game.hohWinner?.id || '']
    });
  }
}

export class PovCompetitionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    
    // Set game phase
    this.game.phase = 'PoV';
    
    // Reset previous PoV winner
    this.game.povWinner = null;
    
    // Get participants (nominees + HoH + some random houseguests)
    const participants = this.getPovParticipants();
    
    // Log the start of PoV competition
    this.game.logEvent({
      type: 'COMPETITION_START',
      description: `Week ${this.game.week} Power of Veto Competition has begun!`,
      involvedHouseguests: participants.map(h => h.id)
    });
    
    // If player is participating, wait for them to choose competition type
    const playerIsParticipating = participants.some(h => h.isPlayer);
    if (playerIsParticipating) {
      // Wait for player to choose competition type
      // This would be triggered by UI components
      return Promise.resolve();
    }
    
    // For AI-controlled game, run the competition automatically
    const results = this.game.competitionSystem.simulatePovCompetition(
      participants, 
      this.game.hohWinner?.id || ''
    );
    
    if (results.length > 0) {
      const winner = results[0].houseguest;
      this.game.povWinner = winner;
      
      // Update winner's stats
      winner.competitionsWon.pov++;
      winner.isPovHolder = true;
      
      this.game.logEvent({
        type: 'POV_WIN',
        description: `${winner.name} has won the Power of Veto!`,
        involvedHouseguests: [winner.id]
      });
      
      // Move to PoV meeting
      await this.transitionTo(PovMeetingState);
    } else {
      this.logger.error('PoV competition failed to produce a winner');
      // Move to PoV meeting anyway
      await this.transitionTo(PovMeetingState);
    }
    
    return Promise.resolve();
  }

  async handleAction(actionId: string, params?: any): Promise<boolean> {
    if (actionId === 'run_pov_competition') {
      const competitionType = params?.type as CompetitionType || 'Physical';
      const participants = this.getPovParticipants();
      
      // Run the competition with the selected type
      const results = this.game.competitionSystem.runCompetition(
        participants,
        competitionType,
        { numberOfWinners: 1 }
      );
      
      if (results.length > 0) {
        const winner = results[0].houseguest;
        this.game.povWinner = winner;
        
        // Update winner's stats
        winner.competitionsWon.pov++;
        winner.isPovHolder = true;
        
        this.game.logEvent({
          type: 'POV_WIN',
          description: `${winner.name} has won the ${competitionType} Power of Veto competition!`,
          involvedHouseguests: [winner.id]
        });
        
        // Move to PoV meeting
        await this.transitionTo(PovMeetingState);
        return true;
      } else {
        this.logger.error('PoV competition failed to produce a winner');
        return false;
      }
    }
    
    return super.handleAction(actionId, params);
  }

  private getPovParticipants(): Houseguest[] {
    // Get the nominees and HoH
    const participants: Houseguest[] = [...this.game.nominees];
    
    if (this.game.hohWinner) {
      participants.push(this.game.hohWinner);
    }
    
    // Add random active houseguests until we have 6 players
    const remainingHouseguests = this.game.getActiveHouseguests()
      .filter(h => !participants.some(p => p.id === h.id))
      .sort(() => 0.5 - Math.random());
      
    while (participants.length < 6 && remainingHouseguests.length > 0) {
      participants.push(remainingHouseguests.pop()!);
    }
    
    return participants;
  }
}

export class PovMeetingState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    
    // Set game phase
    this.game.phase = 'PoVMeeting';
    
    // Log the start of PoV meeting
    this.game.logEvent({
      type: 'POV_MEETING',
      description: `Week ${this.game.week} Veto Meeting has begun!`,
      involvedHouseguests: [this.game.povWinner?.id || ''].filter(Boolean)
    });
    
    // If no PoV winner, skip to eviction
    if (!this.game.povWinner) {
      this.logger.info('No PoV winner, skipping to eviction');
      await this.transitionTo(EvictionState);
      return Promise.resolve();
    }
    
    // If PoV holder is player, wait for their decision
    if (this.game.povWinner.isPlayer) {
      // Wait for player to decide on using the veto
      // This would be triggered by UI components
      return Promise.resolve();
    }
    
    // For AI PoV holder, use AI to make the decision
    if (this.game.povWinner && this.game.aiSystem) {
      const povHolder = this.game.povWinner;
      const isNominated = this.game.nominees.some(n => n.id === povHolder.id);
      
      // Get possible replacement nominees
      const possibleReplacements = this.getPotentialReplacements();
      
      const context = {
        isNominated,
        botName: povHolder.name,
        nominees: this.game.nominees.map(n => n.name),
        possibleReplacements: possibleReplacements.map(h => h.name),
        hohName: this.game.hohWinner?.name || 'Unknown'
      };
      
      try {
        const decision = await this.game.aiSystem.makeDecision(povHolder.name, "veto", context, this.game);
        
        if (decision && typeof decision.useVeto === 'boolean') {
          if (decision.useVeto && decision.vetoTarget) {
            // Find the nominee to save
            const vetoedNominee = this.game.nominees.find(n => n.name === decision.vetoTarget);
            
            if (vetoedNominee) {
              // Find replacement nominee if HoH is making the decision
              let replacement: Houseguest | undefined;
              
              if (this.game.hohWinner && this.game.hohWinner.id !== povHolder.id && decision.replacementNominee) {
                replacement = possibleReplacements.find(h => h.name === decision.replacementNominee);
              } else if (possibleReplacements.length > 0) {
                // If PoV holder is HoH or no replacementNominee specified, pick random
                replacement = possibleReplacements[Math.floor(Math.random() * possibleReplacements.length)];
              }
              
              if (replacement) {
                // Use the veto
                this.useVeto(vetoedNominee, replacement);
              }
            }
          } else {
            // Don't use the veto
            this.decideNotToUseVeto();
          }
        }
      } catch (error) {
        this.logger.error(`AI veto decision error: ${error}`);
        // Default to not using the veto
        this.decideNotToUseVeto();
      }
    }
    
    // Move to eviction
    await this.transitionTo(EvictionState);
    return Promise.resolve();
  }

  async handleAction(actionId: string, params?: any): Promise<boolean> {
    if (actionId === 'use_pov') {
      const { vetoedId, replacementId } = params;
      
      // Find the houseguests by ID
      const vetoedNominee = this.game.nominees.find(n => n.id === vetoedId);
      const replacement = this.getPotentialReplacements().find(h => h.id === replacementId);
      
      if (vetoedNominee && replacement) {
        // Use the veto
        this.useVeto(vetoedNominee, replacement);
        
        // Move to eviction
        await this.transitionTo(EvictionState);
        return true;
      } else {
        this.logger.error('Invalid houseguest IDs for veto');
        return false;
      }
    } else if (actionId === 'dont_use_pov') {
      // Don't use the veto
      this.decideNotToUseVeto();
      
      // Move to eviction
      await this.transitionTo(EvictionState);
      return true;
    }
    
    return super.handleAction(actionId, params);
  }

  private useVeto(vetoedNominee: Houseguest, replacement: Houseguest): void {
    // Update nominees
    this.game.nominees = this.game.nominees.map(nominee => 
      nominee.id === vetoedNominee.id ? replacement : nominee
    );
    
    // Update nomination status
    vetoedNominee.isNominated = false;
    replacement.isNominated = true;
    replacement.nominations++;
    
    // Update relationships
    if (this.game.povWinner) {
      this.game.relationshipSystem.updateRelationships(
        vetoedNominee,
        this.game.povWinner,
        15,
        `${this.game.povWinner.name} used the veto to save ${vetoedNominee.name}`
      );
    }
    
    if (this.game.hohWinner) {
      this.game.relationshipSystem.updateRelationships(
        replacement,
        this.game.hohWinner,
        -20,
        `${this.game.hohWinner.name} named ${replacement.name} as a replacement nominee`
      );
    }
    
    // Log the veto use
    this.game.logEvent({
      type: 'POV_USED',
      description: `${this.game.povWinner?.name} used the Power of Veto on ${vetoedNominee.name}. ${replacement.name} was named as the replacement nominee.`,
      involvedHouseguests: [
        this.game.povWinner?.id || '',
        vetoedNominee.id,
        replacement.id,
        this.game.hohWinner?.id || ''
      ].filter(Boolean)
    });
  }

  private decideNotToUseVeto(): void {
    // Log the decision not to use the veto
    this.game.logEvent({
      type: 'POV_NOT_USED',
      description: `${this.game.povWinner?.name} decided not to use the Power of Veto. The nominations remain the same.`,
      involvedHouseguests: [
        this.game.povWinner?.id || '',
        ...this.game.nominees.map(n => n.id)
      ].filter(Boolean)
    });
  }

  private getPotentialReplacements(): Houseguest[] {
    // Active houseguests who aren't nominees, aren't HoH, and aren't PoV holder
    return this.game.getActiveHouseguests().filter(houseguest => {
      const isNominee = this.game.nominees.some(n => n.id === houseguest.id);
      const isHoH = this.game.hohWinner && this.game.hohWinner.id === houseguest.id;
      const isPovHolder = this.game.povWinner && this.game.povWinner.id === houseguest.id;
      
      return !isNominee && !isHoH && !isPovHolder;
    });
  }
}

export class EvictionState extends GameStateBase {
  private votes: Record<string, string> = {}; // voterId -> nomineeId

  async enter(): Promise<void> {
    await super.enter();
    
    // Set game phase
    this.game.phase = 'Eviction';
    
    // Log the start of eviction
    this.game.logEvent({
      type: 'EVICTION_CEREMONY',
      description: `Week ${this.game.week} Eviction Ceremony has begun!`,
      involvedHouseguests: this.game.nominees.map(n => n.id)
    });
    
    // Reset votes
    this.votes = {};
    
    // If there aren't two nominees, we can't have an eviction
    if (this.game.nominees.length !== 2) {
      this.logger.error('Cannot hold eviction with other than 2 nominees');
      await this.transitionTo(AdvanceWeekState);
      return Promise.resolve();
    }
    
    // Determine eligible voters (active houseguests who aren't nominees or HoH)
    const voters = this.getEligibleVoters();
    
    // If no eligible voters, HoH must break the tie
    if (voters.length === 0) {
      if (this.game.hohWinner) {
        this.handleHohTiebreaker();
      } else {
        this.logger.error('No eligible voters and no HoH for tiebreaker');
        await this.transitionTo(AdvanceWeekState);
      }
      return Promise.resolve();
    }
    
    // If player is eligible to vote, wait for their vote
    const playerCanVote = voters.some(v => v.isPlayer);
    if (playerCanVote) {
      // Wait for player to vote
      // This would be triggered by UI components
      return Promise.resolve();
    }
    
    // For AI voters, collect all votes
    for (const voter of voters) {
      await this.collectAiVote(voter);
    }
    
    // Process vote results
    await this.processVoteResults();
    
    return Promise.resolve();
  }

  async handleAction(actionId: string, params?: any): Promise<boolean> {
    if (actionId === 'cast_vote') {
      const { voterId, nomineeId } = params;
      
      // Check if the voter is eligible
      const isEligible = this.getEligibleVoters().some(v => v.id === voterId);
      
      if (isEligible && this.game.nominees.some(n => n.id === nomineeId)) {
        // Record the vote
        this.votes[voterId] = nomineeId;
        
        // If all votes are in, process the results
        const voters = this.getEligibleVoters();
        const allVotesIn = voters.every(v => this.votes[v.id]);
        
        if (allVotesIn) {
          await this.processVoteResults();
        }
        
        return true;
      } else {
        this.logger.error('Invalid vote: ineligible voter or invalid nominee');
        return false;
      }
    } else if (actionId === 'hoh_tiebreaker') {
      const { nomineeId } = params;
      
      if (this.game.nominees.some(n => n.id === nomineeId)) {
        // Record the HoH's vote
        this.votes['hoh_tiebreaker'] = nomineeId;
        
        // Process the tiebreaker
        await this.processVoteResults(true);
        return true;
      } else {
        this.logger.error('Invalid HoH tiebreaker vote');
        return false;
      }
    }
    
    return super.handleAction(actionId, params);
  }

  private getEligibleVoters(): Houseguest[] {
    return this.game.getActiveHouseguests().filter(houseguest => {
      const isNominee = this.game.nominees.some(n => n.id === houseguest.id);
      const isHoH = this.game.hohWinner && this.game.hohWinner.id === houseguest.id;
      
      return !isNominee && !isHoH;
    });
  }

  private async collectAiVote(voter: Houseguest): Promise<void> {
    if (!this.game.aiSystem || this.game.nominees.length !== 2) {
      return;
    }
    
    const context = {
      botName: voter.name,
      nominees: this.game.nominees.map(n => n.name)
    };
    
    try {
      const decision = await this.game.aiSystem.makeDecision(voter.name, "eviction", context, this.game);
      
      if (decision && decision.vote) {
        // Find the nominee by name
        const nomineeToVote = this.game.nominees.find(n => n.name === decision.vote);
        
        if (nomineeToVote) {
          this.votes[voter.id] = nomineeToVote.id;
          this.logger.info(`${voter.name} voted to evict ${nomineeToVote.name}`);
        }
      }
    } catch (error) {
      this.logger.error(`AI vote error for ${voter.name}: ${error}`);
      // Fall back to random vote
      const randomNominee = this.game.nominees[Math.floor(Math.random() * this.game.nominees.length)];
      this.votes[voter.id] = randomNominee.id;
      this.logger.info(`${voter.name} cast a random vote to evict ${randomNominee.name}`);
    }
  }

  private async processVoteResults(isTiebreaker = false): Promise<void> {
    // Count the votes for each nominee
    const voteCounts: Record<string, number> = {};
    this.game.nominees.forEach(nominee => {
      voteCounts[nominee.id] = 0;
    });
    
    // Count the votes
    Object.values(this.votes).forEach(nomineeId => {
      voteCounts[nomineeId] = (voteCounts[nomineeId] || 0) + 1;
    });
    
    // Determine if there's a tie
    const maxVotes = Math.max(...Object.values(voteCounts));
    const nomineesWithMaxVotes = Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes)
      .map(([id]) => id);
      
    // If tie and not already a tiebreaker, let HoH break the tie
    if (nomineesWithMaxVotes.length > 1 && !isTiebreaker && this.game.hohWinner) {
      this.logger.info('Tie in eviction votes. HoH must break the tie.');
      
      if (this.game.hohWinner.isPlayer) {
        // Wait for player HoH to break the tie
        // This would be triggered by UI components
        return;
      } else {
        this.handleHohTiebreaker();
        return;
      }
    }
    
    // Determine the evicted houseguest
    let evictedId = nomineesWithMaxVotes[0]; // In case of tie and isTiebreaker, pick the first one
    
    // Find the evicted houseguest
    const evictedHouseguest = this.game.houseguests.find(h => h.id === evictedId);
    if (!evictedHouseguest) {
      this.logger.error('Failed to find evicted houseguest');
      await this.transitionTo(AdvanceWeekState);
      return;
    }
    
    // Determine if they go to jury
    const activeHouseguestsLeft = this.game.getActiveHouseguests().length - 1; // -1 for the evicted one
    const shouldJoinJury = activeHouseguestsLeft <= 7; // Typically jury starts with final 9
    
    // Update evicted houseguest's status
    evictedHouseguest.status = shouldJoinJury ? 'Jury' : 'Evicted';
    evictedHouseguest.isNominated = false;
    
    // If they were PoV holder, clear that status
    if (evictedHouseguest.id === this.game.povWinner?.id) {
      evictedHouseguest.isPovHolder = false;
      this.game.povWinner = null;
    }
    
    // If they join the jury, add them to juryMembers
    if (shouldJoinJury) {
      this.game.juryMembers.push(evictedHouseguest);
    }
    
    // Log the eviction
    this.game.logEvent({
      type: 'EVICTION',
      description: `${evictedHouseguest.name} has been evicted from the Big Brother house${shouldJoinJury ? ' and will join the jury' : ''}.`,
      involvedHouseguests: [evictedHouseguest.id]
    });
    
    // Clear nominees
    this.game.nominees = [];
    
    // If there are only 2 or 3 houseguests left, it's finale time
    const remainingActive = this.game.getActiveHouseguests().length;
    if (remainingActive <= 3) {
      await this.transitionTo(FinaleState);
    } else {
      // Otherwise, advance to the next week
      await this.transitionTo(AdvanceWeekState);
    }
  }

  private async handleHohTiebreaker(): Promise<void> {
    if (!this.game.hohWinner || !this.game.aiSystem) {
      await this.transitionTo(AdvanceWeekState);
      return;
    }
    
    const hoh = this.game.hohWinner;
    
    // If it's a player HoH, wait for their decision
    if (hoh.isPlayer) {
      // This would be triggered by UI components
      return;
    }
    
    // Otherwise, let the AI decide
    const context = {
      botName: hoh.name,
      nominees: this.game.nominees.map(n => n.name),
      isTiebreaker: true
    };
    
    try {
      const decision = await this.game.aiSystem.makeDecision(hoh.name, "eviction", context, this.game);
      
      if (decision && decision.vote) {
        // Find the nominee by name
        const nomineeToVote = this.game.nominees.find(n => n.name === decision.vote);
        
        if (nomineeToVote) {
          this.votes['hoh_tiebreaker'] = nomineeToVote.id;
          this.logger.info(`HoH ${hoh.name} broke the tie by voting to evict ${nomineeToVote.name}`);
          
          // Process the tiebreaker
          await this.processVoteResults(true);
        }
      }
    } catch (error) {
      this.logger.error(`AI HoH tiebreaker error: ${error}`);
      // Fall back to random vote
      const randomNominee = this.game.nominees[Math.floor(Math.random() * this.game.nominees.length)];
      this.votes['hoh_tiebreaker'] = randomNominee.id;
      this.logger.info(`HoH ${hoh.name} randomly broke the tie by voting to evict ${randomNominee.name}`);
      
      // Process the tiebreaker
      await this.processVoteResults(true);
    }
  }
}

export class AdvanceWeekState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    
    // Advance to the next week
    this.game.advanceWeek();
    
    // Check if we're at jury phase (usually final 9)
    const activeHouseguests = this.game.getActiveHouseguests();
    
    // Check if we're at final 2 or 3
    if (activeHouseguests.length <= 3) {
      // It's finale time
      await this.transitionTo(FinaleState);
    } else {
      // Start the next week with HoH competition
      await this.transitionTo(HohCompetitionState);
    }
    
    return Promise.resolve();
  }
}

export class FinaleState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    
    // Set game phase
    this.game.phase = 'Finale';
    
    // Log start of finale
    this.game.logEvent({
      type: 'FINALE',
      description: 'The Big Brother finale has begun!',
      involvedHouseguests: this.game.getActiveHouseguests().map(h => h.id)
    });
    
    // Handle finale logic - this would be more complex in a full implementation
    // For now, just pick a winner randomly
    const finalists = this.game.getActiveHouseguests();
    
    if (finalists.length === 0) {
      this.logger.error('No finalists found for finale');
      return Promise.resolve();
    }
    
    // If only one finalist, they win by default
    if (finalists.length === 1) {
      this.game.winner = finalists[0];
      this.game.winner.status = 'Winner';
      
      this.game.logEvent({
        type: 'WINNER',
        description: `${this.game.winner.name} is the winner of Big Brother!`,
        involvedHouseguests: [this.game.winner.id]
      });
      
      await this.transitionTo(GameOverState);
      return Promise.resolve();
    }
    
    // In a real implementation, we'd have a final HoH competition here
    // For now, just pick a winner and runner-up randomly
    finalists.sort(() => 0.5 - Math.random());
    this.game.winner = finalists[0];
    this.game.winner.status = 'Winner';
    this.game.runnerUp = finalists[1];
    this.game.runnerUp.status = 'Runner-Up';
    
    this.game.logEvent({
      type: 'WINNER',
      description: `${this.game.winner.name} has won Big Brother! ${this.game.runnerUp.name} is the runner-up.`,
      involvedHouseguests: [this.game.winner.id, this.game.runnerUp.id]
    });
    
    await this.transitionTo(GameOverState);
    return Promise.resolve();
  }
}

export class GameOverState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    
    // Set game phase
    this.game.phase = 'GameOver';
    
    // Log game over
    this.game.logEvent({
      type: 'GAME_OVER',
      description: 'The game has ended.',
      involvedHouseguests: this.game.winner ? [this.game.winner.id] : []
    });
    
    return Promise.resolve();
  }
}
