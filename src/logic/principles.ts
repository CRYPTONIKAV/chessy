

export type PrincipleCategory = 'opening' | 'middlegame' | 'endgame' | 'tactical';

export interface Principle {
    id: string;
    name: string;
    description: string;
    category: PrincipleCategory;
    explanation: string;
}

export const PRINCIPLES: Principle[] = [
    // Opening Principles
    {
        id: 'center_control',
        name: 'Control the Center',
        description: 'Occupy or influence central squares (e4, d4, e5, d5).',
        category: 'opening',
        explanation: 'Controlling the center allows your pieces maximum mobility and influence.'
    },
    {
        id: 'piece_development',
        name: 'Develop Pieces',
        description: 'Move knights and bishops early to active squares.',
        category: 'opening',
        explanation: 'Developing minor pieces quickly helps you control the board and prepare for castling.'
    },
    {
        id: 'king_safety',
        name: 'King Safety',
        description: 'Castle early to protect your king.',
        category: 'opening',
        explanation: 'Castling moves your king to safety and connects your rooks.'
    },
    {
        id: 'avoid_queen_early',
        name: 'Don’t Move Queen Early',
        description: 'Avoid bringing your queen out before minor pieces.',
        category: 'opening',
        explanation: 'Moving your queen out too early can make it a target for attacks.'
    },
    {
        id: 'donot_move_same_piece_twice',
        name: 'Don’t Move Same Piece Twice',
        description: 'Avoid moving the same piece multiple times in the opening unless necessary.',
        category: 'opening',
        explanation: 'Repeatedly moving the same piece wastes time and delays development.'
    },
    {
        id: 'avoid_edge_pawns',
        name: 'Avoid Edge Pawn Moves',
        description: 'Don’t move a or h pawns in the opening unless necessary.',
        category: 'opening',
        explanation: 'Edge pawn moves don’t help control the center and can weaken your position.'
    },
    {
        id: 'connect_rooks',
        name: 'Connect Rooks',
        description: 'Develop pieces so your rooks can see each other.',
        category: 'opening',
        explanation: 'Connected rooks are more powerful and can control open files.'
    },
    {
        id: 'avoid_weak_pawn_moves',
        name: 'Avoid Weak Pawn Moves',
        description: 'Don’t make unnecessary pawn moves that create weaknesses.',
        category: 'opening',
        explanation: 'Weak pawn moves can create holes in your position and targets for your opponent.'
    },
    {
        id: 'develop_knights_before_bishops',
        name: 'Develop Knights Before Bishops',
        description: 'Knights are usually developed before bishops in the opening.',
        category: 'opening',
        explanation: 'Knights are less flexible than bishops and should be developed first.'
    },
    {
        id: 'avoid_premature_attacks',
        name: 'Avoid Premature Attacks',
        description: 'Don’t attack before completing development.',
        category: 'opening',
        explanation: 'Premature attacks can backfire if your pieces are not ready.'
    },
    {
        id: 'control_open_files',
        name: 'Control Open Files',
        description: 'Place rooks on open or semi-open files.',
        category: 'opening',
        explanation: 'Rooks are most effective on open files where they can exert pressure.'
    },
    {
        id: 'avoid_isolated_pawns',
        name: 'Avoid Isolated Pawns',
        description: 'Don’t create pawns that have no neighbors.',
        category: 'opening',
        explanation: 'Isolated pawns are hard to defend and can become targets.'
    },
    {
        id: 'avoid_doubled_pawns',
        name: 'Avoid Doubled Pawns',
        description: 'Don’t create two pawns on the same file.',
        category: 'opening',
        explanation: 'Doubled pawns are less mobile and can be weak.'
    },
    {
        id: 'avoid_backward_pawns',
        name: 'Avoid Backward Pawns',
        description: 'Don’t leave pawns behind their neighbors.',
        category: 'opening',
        explanation: 'Backward pawns can be hard to defend and block your pieces.'
    },
    {
        id: 'avoid_hanging_pieces',
        name: 'Avoid Hanging Pieces',
        description: 'Don’t leave pieces undefended.',
        category: 'opening',
        explanation: 'Undefended pieces can be captured by your opponent.'
    },
    {
        id: 'avoid_weak_squares',
        name: 'Avoid Weak Squares',
        description: 'Don’t allow your opponent to control squares near your king or center.',
        category: 'opening',
        explanation: 'Weak squares can be used as outposts for enemy pieces.'
    },
    // Middlegame Principles
    {
        id: 'piece_coordination',
        name: 'Piece Coordination',
        description: 'Coordinate your pieces to work together.',
        category: 'middlegame',
        explanation: 'Well-coordinated pieces can create threats and defend each other.'
    },
        {
            id: 'bishop_pair',
            name: 'Value the Bishop Pair',
            description: 'Retain both bishops for their long-range power.',
            category: 'middlegame',
            explanation: 'The bishop pair can dominate open positions and control both color complexes.'
        },
        {
            id: 'pawn_majority',
            name: 'Use Pawn Majority',
            description: 'Advance your pawn majority to create a passed pawn.',
            category: 'endgame',
            explanation: 'A pawn majority can be used to create a passed pawn and win the endgame.'
        },
        {
            id: 'space_advantage',
            name: 'Maintain Space Advantage',
            description: 'Control more territory to restrict your opponent.',
            category: 'middlegame',
            explanation: 'A space advantage allows your pieces more freedom and limits your opponent’s options.'
        },
        {
            id: 'blockade',
            name: 'Blockade Passed Pawns',
            description: 'Use pieces to stop enemy passed pawns from advancing.',
            category: 'endgame',
            explanation: 'Blockading passed pawns prevents them from queening.'
        },
        {
            id: 'prophylaxis',
            name: 'Prophylaxis',
            description: 'Anticipate and prevent your opponent’s plans.',
            category: 'middlegame',
            explanation: 'Prophylactic moves can stop your opponent’s threats before they happen.'
        },
        {
            id: 'initiative',
            name: 'Seize the Initiative',
            description: 'Make moves that force your opponent to respond.',
            category: 'middlegame',
            explanation: 'Having the initiative keeps your opponent on the defensive.'
        },
        {
            id: 'pawn_chains',
            name: 'Maintain Pawn Chains',
            description: 'Keep your pawns connected for mutual support.',
            category: 'middlegame',
            explanation: 'Pawn chains are strong and hard to attack.'
        },
        {
            id: 'open_diagonals',
            name: 'Open Diagonals for Bishops',
            description: 'Use pawn breaks to open diagonals for your bishops.',
            category: 'middlegame',
            explanation: 'Open diagonals allow bishops to become powerful attackers.'
        },
        {
            id: 'rook_lift',
            name: 'Rook Lift',
            description: 'Activate your rook by moving it up the board via a rank.',
            category: 'middlegame',
            explanation: 'Rook lifts can bring your rook into the attack quickly.'
        },
        {
            id: 'minor_piece_endgame',
            name: 'Minor Piece Endgame Knowledge',
            description: 'Know the strengths and weaknesses of bishops vs knights in endgames.',
            category: 'endgame',
            explanation: 'Bishops are better in open positions, knights in closed ones.'
        },
        {
            id: 'pawn_break',
            name: 'Pawn Break',
            description: 'Use pawn advances to open lines and create weaknesses.',
            category: 'middlegame',
            explanation: 'Pawn breaks can open files and diagonals for your pieces.'
        },
        {
            id: 'king_shelter',
            name: 'Maintain King Shelter',
            description: 'Keep pawns near your king to protect it from attacks.',
            category: 'middlegame',
            explanation: 'A good pawn shelter keeps your king safe from enemy pieces.'
        },
        {
            id: 'active_defense',
            name: 'Active Defense',
            description: 'Defend by creating counter-threats rather than passive moves.',
            category: 'middlegame',
            explanation: 'Active defense can turn the tables and create opportunities.'
        },
        {
            id: 'pawn_levers',
            name: 'Use Pawn Levers',
            description: 'Push pawns to challenge your opponent’s structure.',
            category: 'middlegame',
            explanation: 'Pawn levers can open lines and create weaknesses.'
        },
        {
            id: 'avoid_exchange_when_behind',
            name: 'Avoid Exchanges When Behind',
            description: 'Keep pieces on the board when you are down in material.',
            category: 'middlegame',
            explanation: 'Exchanging pieces when behind makes it harder to create counterplay.'
        },
        {
            id: 'activate_all_pieces',
            name: 'Activate All Pieces',
            description: 'Make sure all your pieces are participating in the game.',
            category: 'middlegame',
            explanation: 'Inactive pieces are wasted resources.'
        },
        {
            id: 'avoid_weak_color_complex',
            name: 'Avoid Weak Color Complex',
            description: 'Don’t allow your opponent to dominate squares of one color.',
            category: 'middlegame',
            explanation: 'Weak color complexes can be exploited by bishops.'
        },
        {
            id: 'pawn_minor_piece_coordination',
            name: 'Coordinate Pawns and Minor Pieces',
            description: 'Use pawns and minor pieces together to control key squares.',
            category: 'middlegame',
            explanation: 'Good coordination increases your control and attacking chances.'
        },
        {
            id: 'avoid_uncoordinated_attack',
            name: 'Avoid Uncoordinated Attack',
            description: 'Don’t attack with just one or two pieces.',
            category: 'middlegame',
            explanation: 'Uncoordinated attacks are easily repelled.'
        },
        {
            id: 'avoid_opening_files_for_opponent',
            name: 'Avoid Opening Files for Opponent',
            description: 'Don’t open files that your opponent can use.',
            category: 'middlegame',
            explanation: 'Opening files for your opponent can give them attacking chances.'
        },
        {
            id: 'avoid_king_exposure',
            name: 'Avoid King Exposure',
            description: 'Don’t expose your king unnecessarily.',
            category: 'middlegame',
            explanation: 'An exposed king is vulnerable to attacks.'
        },
        {
            id: 'avoid_pawn_islands',
            name: 'Avoid Pawn Islands',
            description: 'Keep your pawns connected to avoid multiple pawn groups.',
            category: 'endgame',
            explanation: 'Pawn islands are harder to defend.'
        },
        {
            id: 'rook_active_in_endgame',
            name: 'Keep Rook Active in Endgame',
            description: 'Use your rook aggressively in the endgame.',
            category: 'endgame',
            explanation: 'Active rooks can attack pawns and restrict the enemy king.'
        },
        {
            id: 'avoid_unnecessary_pawn_moves',
            name: 'Avoid Unnecessary Pawn Moves',
            description: 'Don’t move pawns without a plan.',
            category: 'endgame',
            explanation: 'Unnecessary pawn moves can create weaknesses.'
        },
        {
            id: 'avoid_trading_pawn_for_piece',
            name: 'Avoid Trading Pawn for Piece',
            description: 'Don’t give up pawns for pieces unless it leads to a win.',
            category: 'endgame',
            explanation: 'Pawns are crucial in the endgame.'
        },
        {
            id: 'avoid_passive_king',
            name: 'Avoid Passive King',
            description: 'Keep your king active in the endgame.',
            category: 'endgame',
            explanation: 'A passive king can’t support pawns or attack weaknesses.'
        },
        {
            id: 'avoid_unnecessary_piece_moves',
            name: 'Avoid Unnecessary Piece Moves',
            description: 'Don’t move pieces without a purpose.',
            category: 'middlegame',
            explanation: 'Unnecessary moves waste time and can weaken your position.'
        },
        {
            id: 'avoid_weak_pawn_endgame',
            name: 'Avoid Weak Pawns in Endgame',
            description: 'Don’t leave pawns undefended in the endgame.',
            category: 'endgame',
            explanation: 'Weak pawns are easy targets in the endgame.'
        },
        {
            id: 'avoid_unnecessary_checks_endgame',
            name: 'Avoid Unnecessary Checks in Endgame',
            description: 'Don’t give checks unless they help your plan.',
            category: 'endgame',
            explanation: 'Unnecessary checks can waste time and lose winning chances.'
        },
        {
            id: 'avoid_trading_queen_in_attack',
            name: 'Avoid Trading Queen When Attacking',
            description: 'Keep your queen when attacking the king.',
            category: 'middlegame',
            explanation: 'The queen is the most powerful attacker.'
        },
        {
            id: 'avoid_blocking_own_pieces',
            name: 'Avoid Blocking Own Pieces',
            description: 'Don’t place your pawns or pieces where they block each other.',
            category: 'middlegame',
            explanation: 'Blocked pieces are less effective.'
        },
        {
            id: 'avoid_weak_king_side',
            name: 'Avoid Weak King Side',
            description: 'Don’t weaken the pawns near your king.',
            category: 'middlegame',
            explanation: 'A weak king side can be attacked easily.'
        },
        {
            id: 'avoid_weak_queen_side',
            name: 'Avoid Weak Queen Side',
            description: 'Don’t weaken the pawns near your queen.',
            category: 'middlegame',
            explanation: 'A weak queen side can be attacked easily.'
        },
        {
            id: 'avoid_unnecessary_piece_exchanges',
            name: 'Avoid Unnecessary Piece Exchanges',
            description: 'Don’t trade pieces without a strategic reason.',
            category: 'middlegame',
            explanation: 'Unnecessary exchanges can help your opponent.'
        },
        {
            id: 'avoid_weak_pawn_structure',
            name: 'Avoid Weak Pawn Structure',
            description: 'Don’t create pawn weaknesses.',
            category: 'middlegame',
            explanation: 'Weak pawn structures are easy to attack.'
        },
        {
            id: 'avoid_unnecessary_king_moves',
            name: 'Avoid Unnecessary King Moves',
            description: 'Don’t move your king unless necessary.',
            category: 'middlegame',
            explanation: 'Unnecessary king moves can expose your king.'
        },
        {
            id: 'avoid_unnecessary_rook_moves',
            name: 'Avoid Unnecessary Rook Moves',
            description: 'Don’t move your rook unless it improves your position.',
            category: 'middlegame',
            explanation: 'Unnecessary rook moves waste time.'
        },
        {
            id: 'avoid_unnecessary_bishop_moves',
            name: 'Avoid Unnecessary Bishop Moves',
            description: 'Don’t move your bishop unless it improves your position.',
            category: 'middlegame',
            explanation: 'Unnecessary bishop moves waste time.'
        },
        {
            id: 'avoid_unnecessary_knight_moves',
            name: 'Avoid Unnecessary Knight Moves',
            description: 'Don’t move your knight unless it improves your position.',
            category: 'middlegame',
            explanation: 'Unnecessary knight moves waste time.'
        },
    {
        id: 'pawn_structure',
        name: 'Pawn Structure',
        description: 'Maintain a healthy pawn structure.',
        category: 'middlegame',
        explanation: 'A strong pawn structure supports your pieces and controls key squares.'
    },
    {
        id: 'open_files_for_rooks',
        name: 'Open Files for Rooks',
        description: 'Use pawn breaks to open files for your rooks.',
        category: 'middlegame',
        explanation: 'Open files allow your rooks to become active and attack.'
    },
    {
        id: 'outposts',
        name: 'Create Outposts',
        description: 'Place knights or bishops on protected squares deep in enemy territory.',
        category: 'middlegame',
        explanation: 'Outposts are powerful positions for your pieces.'
    },
    {
        id: 'exchange_when_ahead',
        name: 'Exchange When Ahead',
        description: 'Trade pieces when you have a material advantage.',
        category: 'middlegame',
        explanation: 'Exchanging pieces simplifies the position and makes your advantage count.'
    },
    {
        id: 'avoid_unnecessary_exchanges',
        name: 'Avoid Unnecessary Exchanges',
        description: 'Don’t trade pieces without a good reason.',
        category: 'middlegame',
        explanation: 'Unnecessary exchanges can help your opponent or weaken your position.'
    },
    {
        id: 'attack_weaknesses',
        name: 'Attack Weaknesses',
        description: 'Target your opponent’s weak pawns or squares.',
        category: 'middlegame',
        explanation: 'Attacking weaknesses can win material or create threats.'
    },
    {
        id: 'defend_weaknesses',
        name: 'Defend Weaknesses',
        description: 'Protect your own weak pawns or squares.',
        category: 'middlegame',
        explanation: 'Defending weaknesses prevents your opponent from gaining an advantage.'
    },
    {
        id: 'avoid_passive_pieces',
        name: 'Avoid Passive Pieces',
        description: 'Keep your pieces active and mobile.',
        category: 'middlegame',
        explanation: 'Passive pieces are easily attacked and don’t contribute to your plans.'
    },
    {
        id: 'double_rooks',
        name: 'Double Rooks',
        description: 'Place two rooks on the same file for maximum power.',
        category: 'middlegame',
        explanation: 'Doubled rooks can dominate open files and attack weaknesses.'
    },
    {
        id: 'avoid_trading_active_pieces',
        name: 'Avoid Trading Active Pieces',
        description: 'Don’t trade your most active pieces for passive ones.',
        category: 'middlegame',
        explanation: 'Active pieces are valuable for creating threats.'
    },
    {
        id: 'control_seventh_rank',
        name: 'Control the Seventh Rank',
        description: 'Place rooks on the seventh rank to attack pawns and the king.',
        category: 'middlegame',
        explanation: 'Rooks on the seventh rank can attack multiple targets.'
    },
    {
        id: 'avoid_weak_back_rank',
        name: 'Avoid Weak Back Rank',
        description: 'Don’t leave your king vulnerable to back rank mates.',
        category: 'middlegame',
        explanation: 'A weak back rank can lead to sudden checkmate.'
    },
    {
        id: 'avoid_time_trouble',
        name: 'Avoid Time Trouble',
        description: 'Manage your clock and avoid running low on time.',
        category: 'middlegame',
        explanation: 'Time trouble can lead to mistakes and missed opportunities.'
    },
    // Endgame Principles
    {
        id: 'king_activity',
        name: 'King Activity',
        description: 'Use your king actively in the endgame.',
        category: 'endgame',
        explanation: 'An active king can support pawns and attack weaknesses.'
    },
    {
        id: 'passed_pawns',
        name: 'Push Passed Pawns',
        description: 'Advance pawns that have no opposing pawns blocking them.',
        category: 'endgame',
        explanation: 'Passed pawns are powerful and can become queens.'
    },
    {
        id: 'create_outside_passed_pawn',
        name: 'Create Outside Passed Pawn',
        description: 'Create a passed pawn on the edge of the board.',
        category: 'endgame',
        explanation: 'Outside passed pawns distract the opponent’s king.'
    },
    {
        id: 'use_opposition',
        name: 'Use Opposition',
        description: 'Control the squares directly in front of the enemy king.',
        category: 'endgame',
        explanation: 'Opposition is key in king and pawn endgames.'
    },
    {
        id: 'activate_rook',
        name: 'Activate Rook',
        description: 'Use your rook actively, not just defensively.',
        category: 'endgame',
        explanation: 'Active rooks can attack pawns and cut off the enemy king.'
    },
    {
        id: 'cut_off_king',
        name: 'Cut Off King',
        description: 'Use your rook to restrict the enemy king’s movement.',
        category: 'endgame',
        explanation: 'Cutting off the king can prevent it from defending pawns.'
    },
    {
        id: 'rook_behind_passed_pawn',
        name: 'Rook Behind Passed Pawn',
        description: 'Place your rook behind your passed pawn.',
        category: 'endgame',
        explanation: 'Rooks are most effective behind passed pawns.'
    },
    {
        id: 'avoid_unnecessary_checks',
        name: 'Avoid Unnecessary Checks',
        description: 'Don’t give checks unless they serve a purpose.',
        category: 'endgame',
        explanation: 'Unnecessary checks can waste time and lose winning chances.'
    },
    {
        id: 'centralize_king',
        name: 'Centralize King',
        description: 'Bring your king to the center in the endgame.',
        category: 'endgame',
        explanation: 'A centralized king controls more squares and supports pawns.'
    },
    {
        id: 'avoid_stalemate',
        name: 'Avoid Stalemate',
        description: 'Don’t allow the opponent to escape with stalemate.',
        category: 'endgame',
        explanation: 'Stalemate can turn a win into a draw.'
    },
    {
        id: 'promote_pawn_safely',
        name: 'Promote Pawn Safely',
        description: 'Ensure your pawn can promote without being captured.',
        category: 'endgame',
        explanation: 'Safe promotion is key to winning the endgame.'
    },
    // Tactical Principles
    {
        id: 'pin',
        name: 'Pin',
        description: 'Attack a piece that cannot move without exposing a more valuable piece.',
        category: 'tactical',
        explanation: 'A pinned piece is restricted and can be attacked.'
    },
    {
        id: 'fork',
        name: 'Fork',
        description: 'Attack two or more pieces at once.',
        category: 'tactical',
        explanation: 'Forks can win material by attacking multiple pieces.'
    },
    {
        id: 'skewer',
        name: 'Skewer',
        description: 'Attack a valuable piece, forcing it to move and exposing a less valuable piece.',
        category: 'tactical',
        explanation: 'Skewers force the opponent to lose material.'
    },
    {
        id: 'discovered_attack',
        name: 'Discovered Attack',
        description: 'Move one piece to reveal an attack from another.',
        category: 'tactical',
        explanation: 'Discovered attacks can surprise your opponent and win material.'
    },
    {
        id: 'double_check',
        name: 'Double Check',
        description: 'Attack the king with two pieces at once.',
        category: 'tactical',
        explanation: 'Double checks are powerful and often force the king to move.'
    },
    {
        id: 'back_rank_mate',
        name: 'Back Rank Mate',
        description: 'Checkmate delivered on the back rank.',
        category: 'tactical',
        explanation: 'Back rank mates exploit a trapped king.'
    },
    {
        id: 'remove_defender',
        name: 'Remove the Defender',
        description: 'Eliminate a piece that is defending another.',
        category: 'tactical',
        explanation: 'Removing defenders can expose targets for attack.'
    },
    {
        id: 'zwischenzug',
        name: 'Zwischenzug (Intermediate Move)',
        description: 'Insert a surprising move before responding to a threat.',
        category: 'tactical',
        explanation: 'Zwischenzug can disrupt your opponent’s plans.'
    },
    {
        id: 'deflection',
        name: 'Deflection',
        description: 'Force an opponent’s piece to leave a key square.',
        category: 'tactical',
        explanation: 'Deflection tactics can win material or deliver mate.'
    },
    {
        id: 'overload',
        name: 'Overload',
        description: 'Attack a piece that is defending multiple threats.',
        category: 'tactical',
        explanation: 'Overloaded pieces can’t defend everything and may be lost.'
    },
    {
        id: 'trapped_piece',
        name: 'Trapped Piece',
        description: 'Trap an opponent’s piece so it cannot escape.',
        category: 'tactical',
        explanation: 'Trapped pieces can be captured for free.'
    },
    {
        id: 'interference',
        name: 'Interference',
        description: 'Block the line of communication between enemy pieces.',
        category: 'tactical',
        explanation: 'Interference can prevent your opponent from defending.'
    },
    {
        id: 'xray_attack',
        name: 'X-ray Attack',
        description: 'Attack through another piece to a target behind it.',
        category: 'tactical',
        explanation: 'X-ray attacks can surprise your opponent and win material.'
    },
    {
        id: 'clearance',
        name: 'Clearance',
        description: 'Move a piece to clear a line for another piece.',
        category: 'tactical',
        explanation: 'Clearance sacrifices can open lines for attack.'
    },
    {
        id: 'perpetual_check',
        name: 'Perpetual Check',
        description: 'Force a draw by giving repeated checks.',
        category: 'tactical',
        explanation: 'Perpetual check can save a lost position.'
    },
    {
        id: 'stalemate_tactic',
        name: 'Stalemate Tactic',
        description: 'Force a draw by stalemating your opponent.',
        category: 'tactical',
        explanation: 'Stalemate tactics can save a game when losing.'
    },
    {
        id: 'undermining',
        name: 'Undermining',
        description: 'Attack the base of a pawn chain.',
        category: 'tactical',
        explanation: 'Undermining can destroy your opponent’s pawn structure.'
    },
    {
        id: 'quiet_move',
        name: 'Quiet Move',
        description: 'Make a non-capturing move that improves your position.',
        category: 'tactical',
        explanation: 'Quiet moves can set up threats and improve your position.'
    },
    {
        id: 'zugzwang',
        name: 'Zugzwang',
        description: 'Force your opponent to make a move that worsens their position.',
        category: 'tactical',
        explanation: 'Zugzwang can turn a draw into a win.'
    }
];
