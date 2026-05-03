import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, TrendingDown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Subscription } from '../types';
import { getMonthlyEquivalent } from '../lib/calculations';
import { formatCurrency } from '../lib/utils';
import { GoogleGenAI, Type } from '@google/genai';

interface AIPredictionsProps {
  subscriptions: Subscription[];
}

interface AIResponse {
  financialHealthScore: number;
  healthSummary: string;
  actionableAdvice: Array<{
    targetSubscription: string;
    actionType: 'CANCEL' | 'DOWNGRADE' | 'BUNDLE' | 'ALTERNATIVE';
    suggestion: string;
    reason: string;
    potentialMonthlySavings: number;
  }>;
}

export function AIPredictions({ subscriptions }: AIPredictionsProps) {
  const [data, setData] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSubs = subscriptions.filter(s => s.isActive);

  async function analyzeSubscriptions() {
    setIsLoading(true);
    setError(null);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API Key is missing. Cannot generate AI analysis.');
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptData = activeSubs.map(s => ({
        name: s.name,
        monthlyCost: getMonthlyEquivalent(s.amount, s.billingCycle),
        category: s.category
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze these subscriptions and provide intelligent savings advice: ${JSON.stringify(promptData)}`,
        config: {
          systemInstruction: 'You are an elite financial advisor specializing in subscription management and wealth building. Analyze the user\'s active subscriptions and determine personalized, realistic ways for them to cut costs, find cheaper alternatives, bundle services, or realize they are overpaying. Return a JSON object matching the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              financialHealthScore: {
                type: Type.NUMBER,
                description: 'A score from 1 to 100 representing how well optimized their subscriptions are.'
              },
              healthSummary: {
                type: Type.STRING,
                description: 'A 2-3 sentence engaging summary of their subscription habits and overall financial impact.'
              },
              actionableAdvice: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    targetSubscription: {
                      type: Type.STRING,
                      description: 'The exact name of the subscription line item this applies to.'
                    },
                    actionType: {
                      type: Type.STRING,
                      description: 'Must be one of CANCEL, DOWNGRADE, BUNDLE, or ALTERNATIVE.'
                    },
                    suggestion: {
                      type: Type.STRING,
                      description: 'The specific alternative, downgrade plan, or bundle name (e.g. "YouTube Premium", "Spotify Duo").'
                    },
                    reason: {
                      type: Type.STRING,
                      description: 'Why this makes sense and how it helps.'
                    },
                    potentialMonthlySavings: {
                      type: Type.NUMBER,
                      description: 'Estimated conservative monthly savings in EUR. Provide a number like 5.50.'
                    }
                  },
                  required: ['targetSubscription', 'actionType', 'suggestion', 'reason', 'potentialMonthlySavings']
                }
              }
            },
            required: ['financialHealthScore', 'healthSummary', 'actionableAdvice']
          }
        }
      });

      const jsonStr = response.text?.trim() || "";
      const parsed = JSON.parse(jsonStr) as AIResponse;
      setData(parsed);
    } catch (err: any) {
      console.error('Failed to get AI predictions', err);
      setError(err.message || 'Something went wrong analyzing your subscriptions.');
    } finally {
      setIsLoading(false);
    }
  }

  // Auto-analyze if we have active subs and no data yet
  useEffect(() => {
    if (activeSubs.length > 0 && !data && !isLoading && !error) {
      analyzeSubscriptions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubs.length]);

  if (activeSubs.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8 border-violet-200 bg-violet-50/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
      <CardHeader className="pb-3 border-b border-violet-100/50 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-violet-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            AI Subscription Analysis
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={analyzeSubscriptions}
            disabled={isLoading}
            className="text-violet-700 hover:bg-violet-100/50 hover:text-violet-900"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 text-violet-500" />}
            Refresh Analysis
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 relative z-10">
        {isLoading && !data && (
          <div className="flex flex-col items-center justify-center py-12 text-violet-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm font-medium animate-pulse">Our AI is analyzing your subscriptions...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={analyzeSubscriptions} variant="outline">Try Again</Button>
          </div>
        )}

        {data && !isLoading && (
           <div className="space-y-8">
             <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center min-w-24 min-h-24 rounded-2xl bg-white border border-violet-100 shadow-sm shrink-0">
                  <span className="text-3xl font-black text-violet-700">{data.financialHealthScore}</span>
                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Health Score</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {data.healthSummary}
                </p>
             </div>

             {data.actionableAdvice && data.actionableAdvice.length > 0 && (
                <div>
                  <h3 className="font-bold text-violet-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Recommended Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.actionableAdvice.map((advice, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-5 border border-violet-100 shadow-sm relative overflow-hidden group hover:border-violet-300 transition-colors">
                        <div className="absolute top-0 right-0 w-1 h-full bg-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="inline-flex items-center rounded-md bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-800">
                              {advice.actionType}
                            </span>
                            <p className="font-bold text-slate-900 mt-2 text-lg">
                              {advice.targetSubscription} <ArrowRight className="inline w-4 h-4 mx-1 text-slate-400" /> {advice.suggestion}
                            </p>
                          </div>
                          {advice.potentialMonthlySavings > 0 && (
                            <div className="text-right shrink-0 ml-2">
                              <span className="text-xs font-semibold text-emerald-600 block uppercase">Save</span>
                              <span className="font-extrabold text-emerald-600 text-lg">+{formatCurrency(advice.potentialMonthlySavings)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {advice.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
             )}
           </div>
        )}
      </CardContent>
    </Card>
  );
}
