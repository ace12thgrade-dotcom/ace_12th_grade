
import { Subject } from './types';

export const OWNER_EMAIL = 'palaashishkumar79@gmail.com';

export const SUBJECTS: Subject[] = [
  { 
    id: 'physics', 
    name: 'Physics', 
    icon: '⚡', 
    color: 'bg-blue-600', 
    chapters: [
      { id: 'p1', title: 'Electric Charges and Fields', description: 'Coulomb’s law, Gauss’s theorem and flux.', isImportant: true, totalParts: 3 },
      { id: 'p2', title: 'Electrostatic Potential and Capacitance', description: 'Electric potential, capacitors, and dielectrics.', totalParts: 3 },
      { id: 'p3', title: 'Current Electricity', description: 'Ohm’s law, Kirchhoff’s laws, and circuits.', isImportant: true, totalParts: 3 },
      { id: 'p4', title: 'Moving Charges and Magnetism', description: 'Biot-Savart and Ampere’s law.', totalParts: 3 },
      { id: 'p5', title: 'Magnetism and Matter', description: 'Magnetic properties and Earth’s field.', totalParts: 2 },
      { id: 'p6', title: 'Electromagnetic Induction', description: 'Faraday’s laws, AC Generator.', totalParts: 2 },
      { id: 'p7', title: 'Alternating Current', description: 'LCR, resonance, transformers.', isImportant: true, totalParts: 3 },
      { id: 'p8', title: 'Electromagnetic Waves', description: 'EM spectrum and displacement current.', totalParts: 1 },
      { id: 'p9', title: 'Ray Optics', description: 'Reflection, refraction, telescopes.', isImportant: true, totalParts: 4 },
      { id: 'p10', title: 'Wave Optics', description: 'Interference, diffraction.', totalParts: 3 },
      { id: 'p11', title: 'Dual Nature of Matter', description: 'Photoelectric effect.', totalParts: 2 },
      { id: 'p12', title: 'Atoms', description: 'Bohr’s model.', totalParts: 2 },
      { id: 'p13', title: 'Nuclei', description: 'Radioactivity, fission, fusion.', totalParts: 2 },
      { id: 'p14', title: 'Semiconductor Electronics', description: 'P-N junction, diodes, logic gates.', isImportant: true, totalParts: 3 }
    ] 
  },
  { 
    id: 'chemistry', 
    name: 'Chemistry', 
    icon: '🧪', 
    color: 'bg-rose-600', 
    chapters: [
      { id: 'c1', title: 'Solutions', description: 'Raoult’s law, colligative properties.', isImportant: true, totalParts: 2 },
      { id: 'c2', title: 'Electrochemistry', description: 'Nernst, conductance, electrolysis.', totalParts: 3 },
      { id: 'c3', title: 'Chemical Kinetics', description: 'Rate laws, collision theory.', isImportant: true, totalParts: 2 },
      { id: 'c4', title: 'd and f Block Elements', description: 'Transitions and Lanthanoids.', totalParts: 2 },
      { id: 'c5', title: 'Coordination Compounds', description: 'Werner, VBT, CFT.', isImportant: true, totalParts: 3 },
      { id: 'c6', title: 'Haloalkanes & Haloarenes', description: 'SN1/SN2 reactions.', isImportant: true, totalParts: 3 },
      { id: 'c7', title: 'Alcohols, Phenols & Ethers', description: 'Mechanisms and uses.', totalParts: 3 },
      { id: 'c8', title: 'Aldehydes & Carboxylic Acids', description: 'Named reactions.', isImportant: true, totalParts: 4 },
      { id: 'c9', title: 'Amines', description: 'Basicity, Diazonium salts.', totalParts: 2 },
      { id: 'c10', title: 'Biomolecules', description: 'Proteins, Nucleic Acids.', totalParts: 2 }
    ] 
  },
  { 
    id: 'maths', 
    name: 'Mathematics', 
    icon: '📐', 
    color: 'bg-indigo-600', 
    chapters: [
      { id: 'm1', title: 'Relations and Functions', description: 'Mappings and types.', totalParts: 2 },
      { id: 'm2', title: 'Inverse Trig Functions', description: 'Principal values.', totalParts: 2 },
      { id: 'm3', title: 'Matrices', description: 'Operations and Inverse.', totalParts: 2 },
      { id: 'm4', title: 'Determinants', description: 'Adjoint and Linear Eqns.', isImportant: true, totalParts: 2 },
      { id: 'm5', title: 'Continuity & Differentiability', description: 'Chain rule, Implicit.', isImportant: true, totalParts: 3 },
      { id: 'm6', title: 'Application of Derivatives', description: 'Maxima and Minima.', isImportant: true, totalParts: 3 },
      { id: 'm7', title: 'Integrals', description: 'Indefinite/Definite.', isImportant: true, totalParts: 4 },
      { id: 'm8', title: 'Application of Integrals', description: 'Area under curves.', isImportant: true, totalParts: 2 },
      { id: 'm9', title: 'Differential Equations', description: 'Order and solving methods.', totalParts: 2 },
      { id: 'm10', title: 'Vector Algebra', description: 'Dot and Cross products.', totalParts: 2 },
      { id: 'm11', title: '3D Geometry', description: 'Lines and Planes.', isImportant: true, totalParts: 3 },
      { id: 'm12', title: 'Linear Programming', description: 'Optimal solutions.', totalParts: 1 },
      { id: 'm13', title: 'Probability', description: 'Bayes Theorem.', isImportant: true, totalParts: 2 }
    ] 
  },
  { 
    id: 'english', 
    name: 'English Core', 
    icon: '📚', 
    color: 'bg-purple-600', 
    chapters: [
      { id: 'ef1', title: 'The Last Lesson (Flamingo)', description: 'M. Hamel and Patriotism.', totalParts: 1 },
      { id: 'ef2', title: 'Lost Spring', description: 'Saheb and Mukesh stories.', totalParts: 1 },
      { id: 'ef3', title: 'Deep Water', description: 'Overcoming fear of water.', totalParts: 1 },
      { id: 'ef4', title: 'The Rattrap', description: 'Metaphorical story of kindness.', totalParts: 1 },
      { id: 'ef5', title: 'Indigo', description: 'Gandhi in Champaran.', totalParts: 1 },
      { id: 'ef6', title: 'Poets and Pancakes', description: 'Gemini Studios and Asokamitran.', totalParts: 1 },
      { id: 'ef7', title: 'The Interview', description: 'Christopher Silvester and Umberto Eco.', totalParts: 1 },
      { id: 'ef8', title: 'Going Places', description: 'Sophie and Jansie.', totalParts: 1 },
      { id: 'ep1', title: 'My Mother at Sixty-Six (Poem)', description: 'Fear of ageing.', totalParts: 1 },
      { id: 'ep3', title: 'Keeping Quiet (Poem)', description: 'Self-introspection.', totalParts: 1 },
      { id: 'ep4', title: 'A Thing of Beauty (Poem)', description: 'Eternal joy from nature.', totalParts: 1 },
      { id: 'ep5', title: 'A Roadside Stand (Poem)', description: 'Rural life vs City life.', totalParts: 1 },
      { id: 'ep6', title: 'Aunt Jennifer’s Tigers (Poem)', description: 'Freedom from oppression.', totalParts: 1 },
      { id: 'ev1', title: 'The Third Level (Vistas)', description: 'Charley’s escape into past.', totalParts: 1 },
      { id: 'ev2', title: 'The Tiger King', description: 'Satire on conceit of power.', totalParts: 1 },
      { id: 'ev3', title: 'Journey to the end of the Earth', description: 'Antarctica expedition.', totalParts: 1 },
      { id: 'ev4', title: 'The Enemy', description: 'Humanity vs Patriotism.', totalParts: 1 },
      { id: 'ev6', title: 'On the Face of It', description: 'Derry and Mr. Lamb.', totalParts: 1 },
      { id: 'ev8', title: 'Memories of Childhood', description: 'Zitkala-Sa and Bama.', totalParts: 1 }
    ] 
  },
  { 
    id: 'computer_science', 
    name: 'Computer Science', 
    icon: '💻', 
    color: 'bg-slate-800', 
    chapters: [
      { id: 'cs1', title: 'Review of Python', description: 'Revision of Class 11 concepts.', totalParts: 2 },
      { id: 'cs2', title: 'Functions', description: 'Global/Local scope, recursion.', isImportant: true, totalParts: 2 },
      { id: 'cs3', title: 'Exception Handling', description: 'Try-except and error types.', totalParts: 1 },
      { id: 'cs4', title: 'File Handling (Text)', description: 'Operations on .txt files.', isImportant: true, totalParts: 2 },
      { id: 'cs5', title: 'File Handling (Binary)', description: 'Pickle module and record management.', isImportant: true, totalParts: 2 },
      { id: 'cs6', title: 'File Handling (CSV)', description: 'Comma Separated Values management.', totalParts: 1 },
      { id: 'cs7', title: 'Data Structures (Stacks)', description: 'LIFO principle using lists.', isImportant: true, totalParts: 1 },
      { id: 'cs8', title: 'Computer Networks - I', description: 'Basics, Media, Topologies.', totalParts: 2 },
      { id: 'cs9', title: 'Computer Networks - II', description: 'Web services and Protocols.', totalParts: 2 },
      { id: 'cs10', title: 'Database Concepts', description: 'Relational model and Keys.', totalParts: 1 },
      { id: 'cs11', title: 'Structured Query Language (SQL)', description: 'DDL and DML commands.', isImportant: true, totalParts: 3 },
      { id: 'cs12', title: 'Interface Python with SQL', description: 'Connecting MySQL with Python.', totalParts: 1 }
    ] 
  },
  { 
    id: 'physical_education', 
    name: 'Physical Education', 
    icon: '🏃', 
    color: 'bg-orange-600', 
    chapters: [
      { id: 'pe1', title: 'Management of Sporting Events', description: 'Planning, Committees, Fixtures.', isImportant: true, totalParts: 1 },
      { id: 'pe2', title: 'Children & Women in Sports', description: 'Common postural deformities.', isImportant: true, totalParts: 1 },
      { id: 'pe3', title: 'Yoga as Preventive measure', description: 'Asanas for lifestyle diseases.', isImportant: true, totalParts: 2 },
      { id: 'pe4', title: 'Physical Education for CWSN', description: 'Divyang sports and adaptive PE.', totalParts: 1 },
      { id: 'pe5', title: 'Sports & Nutrition', description: 'Diet, Nutrients, Weight control.', totalParts: 1 },
      { id: 'pe6', title: 'Test & Measurement in Sports', description: 'Fitness tests and SAI measurements.', totalParts: 1 },
      { id: 'pe7', title: 'Physiology & Injuries in Sports', description: 'Body systems and first aid.', isImportant: true, totalParts: 2 },
      { id: 'pe8', title: 'Biomechanics & Sports', description: 'Newton’s laws and equilibrium.', totalParts: 1 },
      { id: 'pe9', title: 'Psychology & Sports', description: 'Personality, Motivation, Aggression.', totalParts: 1 },
      { id: 'pe10', title: 'Training in Sports', description: 'Strength, Speed, Endurance.', totalParts: 1 }
    ] 
  }
];
