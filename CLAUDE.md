# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CupNote is a specialized coffee recording and community platform for specialty coffee enthusiasts. This repository contains comprehensive product documentation for the CupNote mobile application, written primarily in Korean.

## Repository Structure

The project documentation is organized in the `cupnote-product/` directory with the following structure:

- **01-product-overview/**: Product vision and core features
- **02-user-personas/**: Target user group definitions
- **03-user-journey/**: User experience flows
- **04-information-architecture/**: App structure and navigation
- **05-features/**: Detailed feature specifications
  - **tasting-flow/**: Core recording system with 2-Mode approach (Cafe Mode & HomeCafe Mode)
  - **achievements/**: Gamification system
  - **community-match/**: Community matching and scoring system
  - **my-records/**: Record management system
- **06-ux-patterns/**: Interaction design guidelines
- **07-design-system/**: Design tokens and style guides
- **08-business-model/**: Revenue model and strategy
- **09-competitive-analysis/**: Market analysis
- **10-future-roadmap/**: Development plans

## Key Product Features

### Core System: 2-Mode Recording
The app features two distinct recording modes optimized for different contexts:

1. **Cafe Mode** (5-7 minutes): 
   - 7-step flow for recording cafe experiences
   - Focuses on coffee, cafe atmosphere, and social aspects
   - Includes GPS-based cafe detection and OCR menu scanning

2. **HomeCafe Mode** (8-12 minutes):
   - 5-8 step flow for home brewing
   - Detailed recipe tracking and extraction variables
   - Timer functionality and recipe save/load features

### Key Differentiators
- **Community Match Score**: Compare taste preferences with others who tried the same coffee
- **Achievement System**: 30+ badges, levels, and point rewards for gamification
- **Smart Features**: OCR menu scanning, GPS cafe detection, AI taste expression recommendations
- **Progressive Disclosure**: Information complexity adapts to user expertise level

## Documentation Language

All documentation is written in Korean. When working with this repository:
- Maintain consistency with existing Korean terminology
- Follow the established document structure and formatting
- Reference the main README.md in `cupnote-product/` for document navigation

## Development Context

This is a product documentation repository, not a code repository. There are no build scripts, package.json, or source code files. The focus is on:
- Product strategy and vision
- User experience design
- Feature specifications
- Business model documentation

## Working with Documentation

When modifying or adding documentation:
1. Follow the numbered directory structure (01-, 02-, etc.)
2. Use markdown format consistently
3. Include clear headers and subsections
4. Update the main README.md if adding new major sections
5. Keep language consistent (Korean for all product documentation)

## Quick Reference Paths

For quick access to key documents:
- Product Vision: `cupnote-product/01-product-overview/product-vision.md`
- Core Features: `cupnote-product/01-product-overview/core-features.md`
- Tasting Flow Overview: `cupnote-product/05-features/tasting-flow/tasting-flow-overview.md`
- User Personas: `cupnote-product/02-user-personas/primary-personas.md`
- Information Architecture: `cupnote-product/04-information-architecture/sitemap.md`