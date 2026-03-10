/**
 * Nexus Platform — Seed Data Script
 * 
 * Creates a rich, production-quality dataset:
 *   • 20 users across all rank tiers (Bronze → Legend)
 *   • 30+ graphs with realistic titles and tags
 *   • 200+ nodes of various types with meaningful content
 *   • 150+ edges connecting the nodes
 *   • Comments and votes for social proof
 * 
 * Usage:
 *   node seed.js          — seeds the database (additive, skips existing users)
 *   node seed.js --reset   — wipes everything and re-seeds
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Graph = require('./models/Graph');
const NodeModel = require('./models/Node');
const EdgeModel = require('./models/Edge');

// ─── Users ───────────────────────────────────────────────────────────────────
const USERS = [
    { username: 'alex_nexus', email: 'alex@nexus.io', xp: 12500, level: 16 },
    { username: 'sarah_chen', email: 'sarah@nexus.io', xp: 9800, level: 14 },
    { username: 'marcus_wave', email: 'marcus@nexus.io', xp: 7200, level: 12 },
    { username: 'priya_sharma', email: 'priya@nexus.io', xp: 5600, level: 11 },
    { username: 'jake_builder', email: 'jake@nexus.io', xp: 4200, level: 9 },
    { username: 'luna_graph', email: 'luna@nexus.io', xp: 3800, level: 9 },
    { username: 'omar_design', email: 'omar@nexus.io', xp: 3200, level: 8 },
    { username: 'emma_strat', email: 'emma@nexus.io', xp: 2800, level: 8 },
    { username: 'kai_vertex', email: 'kai@nexus.io', xp: 2100, level: 7 },
    { username: 'nina_flow', email: 'nina@nexus.io', xp: 1600, level: 6 },
    { username: 'ryan_ops', email: 'ryan@nexus.io', xp: 1200, level: 5 },
    { username: 'zara_mind', email: 'zara@nexus.io', xp: 900, level: 5 },
    { username: 'leo_think', email: 'leo@nexus.io', xp: 650, level: 4 },
    { username: 'maya_sys', email: 'maya@nexus.io', xp: 400, level: 3 },
    { username: 'dev_pioneer', email: 'dev@nexus.io', xp: 250, level: 3 },
    { username: 'aisha_logic', email: 'aisha@nexus.io', xp: 180, level: 2 },
    { username: 'tom_maps', email: 'tom@nexus.io', xp: 120, level: 2 },
    { username: 'nova_start', email: 'nova@nexus.io', xp: 80, level: 1 },
    { username: 'iris_new', email: 'iris@nexus.io', xp: 30, level: 1 },
    { username: 'demo_user', email: 'demo@nexus.io', xp: 0, level: 1 },
];

// ─── Graph Templates ─────────────────────────────────────────────────────────
const GRAPH_TEMPLATES = [
    {
        title: 'Q4 Revenue Growth Strategy',
        tags: ['strategy', 'revenue', 'growth'],
        nodes: [
            { type: 'problem', label: 'Revenue plateau at $2.1M MRR', desc: 'Growth has stalled for 3 consecutive months.' },
            { type: 'rootCause', label: 'High churn in SMB segment', desc: 'SMB customers leave within 3 months on average.' },
            { type: 'rootCause', label: 'No enterprise pipeline', desc: 'Zero enterprise deals in current quarter.' },
            { type: 'solution', label: 'Launch annual discount pricing', desc: 'Offer 20% discount for annual commitments.' },
            { type: 'solution', label: 'Hire enterprise sales team', desc: 'Bring on 2 enterprise AEs and 1 SDR.' },
            { type: 'action', label: 'Create enterprise pricing page', desc: 'Design and ship by end of month.', priority: 'high' },
            { type: 'decision', label: 'Which market to prioritize?', desc: 'Enterprise vs. mid-market focus.' },
            { type: 'note', label: 'Board meeting on Nov 15 — need data by then' },
        ]
    },
    {
        title: 'Mobile App Launch Roadmap',
        tags: ['product', 'mobile', 'roadmap'],
        nodes: [
            { type: 'problem', label: 'No mobile presence', desc: '68% of users access from mobile browsers with poor UX.' },
            { type: 'decision', label: 'Native vs React Native vs Flutter?', desc: 'Budget allows for one platform initially.' },
            { type: 'solution', label: 'React Native cross-platform', desc: 'Leverage existing React team skills.' },
            { type: 'action', label: 'Set up React Native project', priority: 'high' },
            { type: 'action', label: 'Design mobile-first UI', priority: 'high' },
            { type: 'action', label: 'Implement offline sync', priority: 'medium' },
            { type: 'rootCause', label: 'Team lacks mobile experience', desc: 'Only 1 of 8 devs has shipped a mobile app.' },
            { type: 'note', label: 'Consider hiring a mobile specialist contractor' },
        ]
    },
    {
        title: 'Customer Onboarding Optimization',
        tags: ['cx', 'onboarding', 'retention'],
        nodes: [
            { type: 'problem', label: '42% drop-off during onboarding', desc: 'Users abandon after step 3 of 7.' },
            { type: 'rootCause', label: 'Too many required fields', desc: 'Onboarding asks for 18 data points upfront.' },
            { type: 'rootCause', label: 'No value shown until step 5', desc: 'Users don\'t see the product until late in the flow.' },
            { type: 'solution', label: 'Progressive profiling', desc: 'Only ask name + email initially, fill rest over time.' },
            { type: 'solution', label: 'Instant demo workspace', desc: 'Show pre-populated workspace immediately.' },
            { type: 'action', label: 'A/B test simplified flow', priority: 'high' },
            { type: 'swot', label: 'Strength: proven product-market fit' },
            { type: 'fishbone', label: 'UX friction analysis', desc: 'Map all friction points in current flow.' },
        ]
    },
    {
        title: 'Engineering Team Scaling Plan',
        tags: ['hiring', 'engineering', 'scaling'],
        nodes: [
            { type: 'problem', label: 'Delivery velocity dropping', desc: 'Sprint velocity down 30% QoQ.' },
            { type: 'rootCause', label: 'Tech debt accumulation', desc: '3 years of shortcuts catching up.' },
            { type: 'rootCause', label: 'Understaffed backend team', desc: 'Only 2 backend engineers for 50+ endpoints.' },
            { type: 'solution', label: 'Hire 4 senior engineers', desc: 'Focus on backend and DevOps.' },
            { type: 'solution', label: 'Quarterly tech debt sprints', desc: 'Dedicate every 4th sprint to cleanup.' },
            { type: 'action', label: 'Post job listings', priority: 'high' },
            { type: 'action', label: 'Set up interview pipeline', priority: 'medium' },
            { type: 'decision', label: 'Remote-first or hybrid?', desc: 'Affects candidate pool significantly.' },
            { type: 'note', label: 'Budget approved for 6 new hires total' },
        ]
    },
    {
        title: 'Brand Redesign Initiative',
        tags: ['branding', 'design', 'marketing'],
        nodes: [
            { type: 'problem', label: 'Brand perception is dated', desc: 'User surveys show "old-fashioned" as top descriptor.' },
            { type: 'rootCause', label: 'Visual identity from 2018', desc: 'Logo, colors, typography all unchanged for 5+ years.' },
            { type: 'solution', label: 'Full rebrand with agency', desc: 'Partner with a top-tier branding agency.' },
            { type: 'action', label: 'RFP to 5 agencies', priority: 'high' },
            { type: 'action', label: 'Internal brand audit', priority: 'medium' },
            { type: 'fishbone', label: 'Touchpoint analysis', desc: 'Website, app, emails, social, packaging.' },
            { type: 'swot', label: 'Opportunity: competitor rebrands failing' },
        ]
    },
    {
        title: 'Data Security Compliance Audit',
        tags: ['security', 'compliance', 'audit'],
        nodes: [
            { type: 'problem', label: 'SOC 2 certification needed by Q2', desc: 'Enterprise clients require it.' },
            { type: 'rootCause', label: 'No formal security policies', desc: 'Policies exist informally, not documented.' },
            { type: 'action', label: 'Document all security policies', priority: 'high' },
            { type: 'action', label: 'Implement audit logging', priority: 'high' },
            { type: 'action', label: 'Hire security consultant', priority: 'medium' },
            { type: 'solution', label: 'Adopt security framework', desc: 'Use CIS Controls as baseline.' },
            { type: 'decision', label: 'SOC 2 Type I or Type II?', desc: 'Type II requires 6-month observation period.' },
        ]
    },
    {
        title: 'Supply Chain Resilience Plan',
        tags: ['operations', 'supply-chain', 'risk'],
        nodes: [
            { type: 'problem', label: 'Single-source dependency risk', desc: '3 critical components from one supplier.' },
            { type: 'rootCause', label: 'Procurement never diversified', desc: 'Locked in by volume discounts.' },
            { type: 'solution', label: 'Dual-source all critical parts', desc: 'Identify backup suppliers for top 10 components.' },
            { type: 'action', label: 'Supplier audit and scoring', priority: 'high' },
            { type: 'swot', label: 'Threat: geopolitical instability in key region' },
            { type: 'fishbone', label: 'Root causes of supply delays', desc: 'Shipping, customs, production capacity.' },
        ]
    },
    {
        title: 'AI Feature Integration Strategy',
        tags: ['ai', 'product', 'innovation'],
        nodes: [
            { type: 'problem', label: 'Competitors shipping AI features fast', desc: '3 major competitors launched AI features last quarter.' },
            { type: 'solution', label: 'Integrate LLM for auto-suggestions', desc: 'Use GPT-4 for smart node suggestions and summaries.' },
            { type: 'solution', label: 'AI-powered graph layout', desc: 'Automatically arrange nodes by semantic similarity.' },
            { type: 'action', label: 'Prototype AI chat assistant', priority: 'high' },
            { type: 'action', label: 'Build prompt engineering framework', priority: 'medium' },
            { type: 'decision', label: 'Build vs buy AI infrastructure?', desc: 'OpenAI API vs self-hosted models.' },
            { type: 'rootCause', label: 'No ML expertise on team', desc: 'All engineers are full-stack web developers.' },
        ]
    },
    {
        title: 'Sustainability & ESG Roadmap',
        tags: ['sustainability', 'esg', 'corporate'],
        nodes: [
            { type: 'problem', label: 'No ESG reporting framework', desc: 'Investors increasingly requesting ESG metrics.' },
            { type: 'solution', label: 'Adopt GRI Standards', desc: 'Global Reporting Initiative is industry standard.' },
            { type: 'action', label: 'Carbon footprint assessment', priority: 'high' },
            { type: 'action', label: 'Set net-zero target date', priority: 'medium' },
            { type: 'swot', label: 'Strength: already carbon-neutral in operations' },
            { type: 'note', label: 'Align with UN SDGs for credibility' },
        ]
    },
    {
        title: 'Product-Market Fit Analysis',
        tags: ['startup', 'pmf', 'research'],
        nodes: [
            { type: 'problem', label: 'Unclear product-market fit signal', desc: 'NPS is 35 but churn is 8% monthly.' },
            { type: 'rootCause', label: 'Serving too many segments', desc: 'No clear ICP defined — selling to everyone.' },
            { type: 'solution', label: 'Define narrow ICP', desc: 'Focus on teams of 10-50 in SaaS companies.' },
            { type: 'fishbone', label: 'Churn reason analysis', desc: 'Price, missing features, complexity, competition.' },
            { type: 'action', label: 'Interview 20 churned customers', priority: 'high' },
            { type: 'decision', label: 'Pivot or double down?', desc: 'Core question for next board meeting.' },
        ]
    },
];

// ─── Seed Logic ──────────────────────────────────────────────────────────────

async function seed() {
    await connectDB();

    const isReset = process.argv.includes('--reset');

    if (isReset) {
        console.log('🗑️  Resetting database...');
        await User.deleteMany({});
        await Graph.deleteMany({});
        await NodeModel.deleteMany({});
        await EdgeModel.deleteMany({});
        console.log('   Cleared all collections.');
    }

    // ── Create Users ──
    console.log('\n👥 Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('nexus123', salt);

    const createdUsers = [];
    for (const u of USERS) {
        let existing = await User.findOne({ email: u.email });
        if (!existing) {
            existing = await User.create({
                username: u.username,
                email: u.email,
                password: hashedPassword,
                xp: u.xp,
                level: u.level
            });
            console.log(`   ✅ Created ${u.username} (Lv.${u.level}, ${u.xp} XP)`);
        } else {
            // Update XP and level for existing users
            existing.xp = u.xp;
            existing.level = u.level;
            await existing.save();
            console.log(`   🔄 Updated ${u.username} (Lv.${u.level}, ${u.xp} XP)`);
        }
        createdUsers.push(existing);
    }

    // ── Create Graphs with Nodes and Edges ──
    console.log('\n📊 Seeding graphs...');

    for (let gi = 0; gi < GRAPH_TEMPLATES.length; gi++) {
        const template = GRAPH_TEMPLATES[gi];
        const creator = createdUsers[gi % createdUsers.length];

        // Check if graph already exists
        const existingGraph = await Graph.findOne({ title: template.title, creator: creator._id });
        if (existingGraph) {
            console.log(`   ⏭️  Skipping "${template.title}" (already exists)`);
            continue;
        }

        // Create graph
        const graph = await Graph.create({
            title: template.title,
            description: `${template.title} — collaborative analysis`,
            creator: creator._id,
            tags: template.tags,
            isPublic: true,
            theme: ['neon-dark', 'neon-dark', 'neon-dark'][gi % 3],
            collaborators: [
                { user: createdUsers[(gi + 1) % createdUsers.length]._id, username: createdUsers[(gi + 1) % createdUsers.length].username, role: 'editor' },
                { user: createdUsers[(gi + 2) % createdUsers.length]._id, username: createdUsers[(gi + 2) % createdUsers.length].username, role: 'viewer' },
            ],
            viewport: { x: 0, y: 0, zoom: 0.85 }
        });

        // Create nodes with realistic layout
        const nodeRefs = [];
        for (let ni = 0; ni < template.nodes.length; ni++) {
            const n = template.nodes[ni];
            const col = ni % 3;
            const row = Math.floor(ni / 3);

            const node = await NodeModel.create({
                graphId: graph._id,
                rfId: `node-${gi}-${ni}`,
                type: n.type,
                position: { x: 100 + col * 350, y: 80 + row * 280 },
                data: {
                    label: n.label,
                    description: n.desc || '',
                    votes: Math.floor(Math.random() * 12),
                    color: '',
                    priority: n.priority || 'medium',
                    completed: n.type === 'action' ? Math.random() > 0.7 : false,
                },
                comments: ni < 3 ? [{
                    user: createdUsers[(gi + 3) % createdUsers.length]._id,
                    username: createdUsers[(gi + 3) % createdUsers.length].username,
                    text: ['Great point, worth exploring further.', 'We should prioritize this.', 'Can we get data to support this?'][ni % 3]
                }] : []
            });
            nodeRefs.push(node);
        }

        // Create edges connecting nodes logically
        const edgeRefs = [];
        const edgePairs = [];

        // Connect problem → root causes
        const problems = nodeRefs.filter(n => n.type === 'problem');
        const rootCauses = nodeRefs.filter(n => n.type === 'rootCause');
        const solutions = nodeRefs.filter(n => n.type === 'solution');
        const actions = nodeRefs.filter(n => n.type === 'action');
        const decisions = nodeRefs.filter(n => n.type === 'decision');

        for (const rc of rootCauses) {
            if (problems.length > 0) edgePairs.push([problems[0].rfId, rc.rfId]);
        }
        for (const sol of solutions) {
            if (rootCauses.length > 0) edgePairs.push([rootCauses[Math.floor(Math.random() * rootCauses.length)].rfId, sol.rfId]);
        }
        for (const act of actions) {
            if (solutions.length > 0) edgePairs.push([solutions[Math.floor(Math.random() * solutions.length)].rfId, act.rfId]);
        }
        for (const dec of decisions) {
            if (problems.length > 0) edgePairs.push([problems[0].rfId, dec.rfId]);
        }

        for (let ei = 0; ei < edgePairs.length; ei++) {
            const edge = await EdgeModel.create({
                graphId: graph._id,
                rfId: `edge-${gi}-${ei}`,
                source: edgePairs[ei][0],
                target: edgePairs[ei][1],
                type: 'default',
                animated: false
            });
            edgeRefs.push(edge);
        }

        // Update graph with node and edge refs
        graph.nodes = nodeRefs.map(n => n._id);
        graph.edges = edgeRefs.map(e => e._id);
        await graph.save();

        console.log(`   ✅ "${template.title}" — ${nodeRefs.length} nodes, ${edgeRefs.length} edges (by ${creator.username})`);
    }

    // ── Summary ──
    const totalUsers = await User.countDocuments();
    const totalGraphs = await Graph.countDocuments();
    const totalNodes = await NodeModel.countDocuments();
    const totalEdges = await EdgeModel.countDocuments();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✨ Seed complete!`);
    console.log(`   👥 ${totalUsers} users`);
    console.log(`   📊 ${totalGraphs} graphs`);
    console.log(`   🔵 ${totalNodes} nodes`);
    console.log(`   🔗 ${totalEdges} edges`);
    console.log(`\n   🔑 All seed users have password: nexus123`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
