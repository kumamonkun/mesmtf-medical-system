'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
}

interface InteractionCheckResult {
  drugs_checked: string[];
  interactions: DrugInteraction[];
  risk_level: 'none' | 'minor' | 'moderate' | 'critical';
  summary: {
    total_interactions: number;
    critical_count: number;
    moderate_count: number;
    minor_count: number;
  };
}

const DrugInteractions: React.FC = () => {
  const [drugInput, setDrugInput] = useState('');
  const [drugs, setDrugs] = useState<string[]>([]);
  const [result, setResult] = useState<InteractionCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDrug = () => {
    const drugName = drugInput.trim();
    if (drugName && !drugs.includes(drugName)) {
      setDrugs([...drugs, drugName]);
      setDrugInput('');
    }
  };

  const removeDrug = (drugToRemove: string) => {
    setDrugs(drugs.filter(drug => drug !== drugToRemove));
  };

  const checkInteractions = async () => {
    if (drugs.length < 2) {
      setError('Please add at least 2 drugs to check for interactions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/drugs/interactions?' + new URLSearchParams({
        drugs: drugs.join(',')
      }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check interactions');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4" />;
      case 'minor': return <Info className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Drug Interaction Checker</h2>
        <p className="text-gray-600">Check for potential drug interactions between multiple medications</p>
      </div>

      {/* Drug Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Drugs to Check</CardTitle>
          <CardDescription>
            Enter drug names to check for potential interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter drug name (e.g., Chloroquine)"
              value={drugInput}
              onChange={(e) => setDrugInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDrug()}
            />
            <Button onClick={addDrug} disabled={!drugInput.trim()}>
              Add Drug
            </Button>
          </div>

          {/* Selected Drugs */}
          {drugs.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected Drugs:</p>
              <div className="flex flex-wrap gap-2">
                {drugs.map((drug, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {drug}
                    <button
                      onClick={() => removeDrug(drug)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={checkInteractions}
            disabled={drugs.length < 2 || loading}
            className="w-full"
          >
            {loading ? 'Checking Interactions...' : 'Check Interactions'}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Risk Level Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Interaction Summary
                <Badge className={getRiskLevelColor(result.risk_level)}>
                  {result.risk_level.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {result.summary.total_interactions}
                  </div>
                  <div className="text-sm text-gray-600">Total Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {result.summary.critical_count}
                  </div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {result.summary.moderate_count}
                  </div>
                  <div className="text-sm text-gray-600">Moderate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.summary.minor_count}
                  </div>
                  <div className="text-sm text-gray-600">Minor</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Interactions */}
          {result.interactions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Detected Interactions</CardTitle>
                <CardDescription>
                  Review the following drug interactions and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.interactions.map((interaction, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {interaction.drug1} + {interaction.drug2}
                          </span>
                          <Badge className={getSeverityColor(interaction.severity)}>
                            {getSeverityIcon(interaction.severity)}
                            <span className="ml-1 capitalize">{interaction.severity}</span>
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>Description:</strong> {interaction.description}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Recommendation:</strong> {interaction.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-900">No Interactions Found</h3>
                  <p className="text-gray-600">
                    No significant drug interactions were detected between the selected medications.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DrugInteractions;
