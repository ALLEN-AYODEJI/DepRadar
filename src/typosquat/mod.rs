//! Typosquat detection module.
//!
//! Scoring logic is not implemented yet. For now this module bundles the
//! reference data a typosquat check needs — the lists of popular package names
//! an attacker is most likely to imitate ([`dataset`]) — and the edit-distance
//! primitives for comparing a candidate name against them ([`distance`]).

pub mod dataset;
pub mod distance;
