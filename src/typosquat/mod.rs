//! Typosquat detection module.
//!
//! Scoring logic is not implemented yet. For now this module bundles the
//! reference data a typosquat check needs — the lists of popular package names
//! an attacker is most likely to imitate ([`dataset`]) — and two independent
//! signals for comparing a candidate name against them: the edit-distance
//! primitives in [`distance`] and the lookalike-character checks in
//! [`homoglyph`].

pub mod dataset;
pub mod distance;
pub mod homoglyph;
