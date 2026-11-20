import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const FoodInsightAIApp());
}

class FoodInsightAIApp extends StatelessWidget {
  const FoodInsightAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FoodInsightAI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF090D16),
        primaryColor: const Color(0xFF10B981),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF3B82F6),
          surface: Color(0xFF131D2E),
        ),
        fontFamily: 'Roboto',
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  // Selected food items for FoodLab
  final List<String> _selectedFoodLabItems = ['Milk', 'Orange'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _currentIndex == 2 ? 'FOOD LAB™' : 'FoodInsightAI',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  _currentIndex == 2 ? 'Virtual Food Experimentation Laboratory' : 'Personal Food Intelligence',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.dns, color: Color(0xFF10B981), size: 20),
            tooltip: 'Backend API: http://10.0.2.2:8000',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Configured Backend: http://10.0.2.2:8000/api/v1/'),
                  backgroundColor: Color(0xFF131D2E),
                ),
              );
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeScreen(),
          _buildScanScreen(),
          _buildFoodLabScreen(),
          _buildOverviewDashboardScreen(),
          _buildProfileHistoryScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        backgroundColor: const Color(0xFF0F172A),
        indicatorColor: const Color(0xFF10B981).withOpacity(0.2),
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined, color: Color(0xFF94A3B8)),
            selectedIcon: Icon(Icons.home, color: Color(0xFF10B981)),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.camera_alt_outlined, color: Color(0xFF94A3B8)),
            selectedIcon: Icon(Icons.camera_alt, color: Color(0xFF10B981)),
            label: 'Scan',
          ),
          NavigationDestination(
            icon: Icon(Icons.science_outlined, color: Color(0xFF94A3B8)),
            selectedIcon: Icon(Icons.science, color: Color(0xFF10B981)),
            label: 'FOOD LAB',
          ),
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined, color: Color(0xFF94A3B8)),
            selectedIcon: Icon(Icons.dashboard, color: Color(0xFF10B981)),
            label: 'Overview',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline, color: Color(0xFF94A3B8)),
            selectedIcon: Icon(Icons.person, color: Color(0xFF10B981)),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  // ==================== SCREEN 1: HOME ====================
  Widget _buildHomeScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Glassmorphic Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF131D2E), const Color(0xFF0F172A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified, color: Color(0xFF10B981), size: 14),
                          SizedBox(width: 4),
                          Text(
                            'AI Food Intelligence Hub',
                            style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Make Informed Food Decisions with Real Science & AI',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white, height: 1.3),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Analyze nutrition macros, detect hidden allergens, verify peer-reviewed evidence, and simulate virtual recipes in FOOD LAB™.',
                  style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8), height: 1.4),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedCornerShape(14),
                        ),
                        onPressed: () => setState(() => _currentIndex = 1),
                        icon: const Icon(Icons.camera_alt, size: 18),
                        label: const Text('Scan Meal', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3B82F6),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedCornerShape(14),
                        ),
                        onPressed: () => setState(() => _currentIndex = 2),
                        icon: const Icon(Icons.science, size: 18),
                        label: const Text('FOOD LAB™', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Two Core Pillars Banner
          const Text(
            'Two Core Pillars',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildFeatureCard(
                  title: '1. Food Analysis',
                  desc: 'Photo scanner & 12-step AI nutritional breakdown.',
                  icon: Icons.search,
                  color: const Color(0xFF10B981),
                  onTap: () => setState(() => _currentIndex = 1),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildFeatureCard(
                  title: '2. FOOD LAB™',
                  desc: 'Virtual recipe combinations & safety simulation.',
                  icon: Icons.biotech,
                  color: const Color(0xFF3B82F6),
                  onTap: () => setState(() => _currentIndex = 2),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Quick Recent Analysis Preview
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF131D2E),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80',
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 60,
                      height: 60,
                      color: const Color(0xFF1E293B),
                      child: const Icon(Icons.restaurant, color: Color(0xFF10B981)),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Last Analyzed: Paneer Biryani', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14)),
                      const SizedBox(height: 4),
                      const Text('520 kcal • 18g Protein • 92% Match', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFF10B981)),
                  onPressed: () => setState(() => _currentIndex = 3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard({
    required String title,
    required String desc,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF131D2E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14)),
            const SizedBox(height: 4),
            Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.3)),
          ],
        ),
      ),
    );
  }

  // ==================== SCREEN 2: SCAN ====================
  Widget _buildScanScreen() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [const Color(0xFF10B981).withOpacity(0.2), const Color(0xFF3B82F6).withOpacity(0.2)],
                ),
                border: Border.all(color: const Color(0xFF10B981), width: 2),
              ),
              child: const Icon(Icons.camera_alt, color: Color(0xFF10B981), size: 56),
            ),
            const SizedBox(height: 24),
            const Text(
              'Food Photo Scanner',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'Point your phone camera at any meal to identify ingredients, calories, allergens, and scientific evidence.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedCornerShape(14),
              ),
              onPressed: () {
                setState(() => _currentIndex = 3); // Open Overview
              },
              icon: const Icon(Icons.flash_on),
              label: const Text('Capture & Analyze Now', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  // ==================== SCREEN 3: FOOD LAB ====================
  Widget _buildFoodLabScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // FOOD LAB Branding Header
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF047857).withOpacity(0.2), const Color(0xFF131D2E)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.science, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('FOOD LAB™', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      Text('Virtual Food Experimentation Laboratory', style: TextStyle(fontSize: 11, color: Color(0xFF6EE7B7))),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Simulation Example: Milk + Orange (Uneatable Reaction)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF131D2E),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Formulation Tested', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.redAccent.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.redAccent),
                      ),
                      child: const Text('UNEATABLE / RISKY', style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('Orange Milk Drink (Milk + Orange)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.red.withOpacity(0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Chemical Interaction: Citric acid from orange reacts with milk casein proteins, causing instant curdling and acute gastric distress.',
                          style: TextStyle(color: Color(0xFFFCA5A5), fontSize: 11, height: 1.3),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    _buildMetricBadge('Risk Weight', '85 / 100', Colors.redAccent),
                    const SizedBox(width: 10),
                    _buildMetricBadge('Calories', '154 kcal', const Color(0xFF10B981)),
                    const SizedBox(width: 10),
                    _buildMetricBadge('Protein', '6.4g', const Color(0xFF3B82F6)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Food Catalogue & New Experiment Button
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedCornerShape(14),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Opening Food Catalogue to combine foods...')),
              );
            },
            icon: const Icon(Icons.add),
            label: const Text('Start New Virtual Formulation', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricBadge(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10)),
            const SizedBox(height: 2),
            Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  // ==================== SCREEN 4: OVERVIEW DASHBOARD ====================
  Widget _buildOverviewDashboardScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Meal Title Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF131D2E),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Image.network(
                    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
                    width: 72,
                    height: 72,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(Icons.fastfood, size: 40, color: Color(0xFF10B981)),
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Paneer Biryani', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      SizedBox(height: 4),
                      Text('Indian Cuisine • Main Course', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                      SizedBox(height: 6),
                      Text('Verified Match: 92% Confidence', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Calorie and Macro Grid
          Row(
            children: [
              _buildMacroCard('520', 'Calories', 'kcal', const Color(0xFFF59E0B)),
              const SizedBox(width: 8),
              _buildMacroCard('18g', 'Protein', 'High', const Color(0xFF10B981)),
              const SizedBox(width: 8),
              _buildMacroCard('65g', 'Carbs', 'Moderate', const Color(0xFF3B82F6)),
              const SizedBox(width: 8),
              _buildMacroCard('20g', 'Fat', 'Moderate', const Color(0xFFEC4899)),
            ],
          ),
          const SizedBox(height: 16),

          // Evidence-backed USDA / NIH Notice
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF131D2E),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2)),
            ),
            child: const Row(
              children: [
                Icon(Icons.library_books, color: Color(0xFF10B981), size: 22),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Peer-Reviewed Evidence (RAG)', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      SizedBox(height: 2),
                      Text('USDA FoodData Central #110283 & NIH Dietary Guidelines', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMacroCard(String val, String label, String sub, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF131D2E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Text(val, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 10, color: Colors.white)),
            Text(sub, style: TextStyle(fontSize: 9, color: color.withOpacity(0.8))),
          ],
        ),
      ),
    );
  }

  // ==================== SCREEN 5: PROFILE & HISTORY ====================
  Widget _buildProfileHistoryScreen() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Personal Dietary Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF131D2E),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              children: [
                _ProfileRow(label: 'Dietary Preference', value: 'Vegetarian'),
                Divider(color: Colors.white10),
                _ProfileRow(label: 'Allergens Monitored', value: 'Peanuts, Shellfish'),
                Divider(color: Colors.white10),
                _ProfileRow(label: 'Calorie Target', value: '2,000 kcal / day'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  final String label;
  final String value;
  const _ProfileRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }
}
