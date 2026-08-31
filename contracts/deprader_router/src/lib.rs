#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Bounty {
    pub creator: Address,
    pub issue_ref: String,
    pub amount: i128,
    pub token: Address,
}

#[contracttype]
enum DataKey {
    Bounty(u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    InvalidAmount = 1,
    BountyAlreadyExists = 2,
}

#[contract]
pub struct DepRaderRouter;

#[contractimpl]
impl DepRaderRouter {
    /// Locks `amount` of `token` from `creator` into the contract against `bounty_id`.
    pub fn create_bounty(
        env: Env,
        creator: Address,
        bounty_id: u64,
        issue_ref: String,
        amount: i128,
        token: Address,
    ) -> Result<(), Error> {
        creator.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let key = DataKey::Bounty(bounty_id);
        if env.storage().persistent().has(&key) {
            return Err(Error::BountyAlreadyExists);
        }

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&creator, &env.current_contract_address(), &amount);

        let bounty = Bounty {
            creator,
            issue_ref,
            amount,
            token,
        };
        env.storage().persistent().set(&key, &bounty);

        Ok(())
    }

    /// Reads back the stored state for a bounty, if one exists.
    pub fn get_bounty(env: Env, bounty_id: u64) -> Option<Bounty> {
        env.storage().persistent().get(&DataKey::Bounty(bounty_id))
    }
}

#[cfg(test)]
mod test;
