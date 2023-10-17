#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use openbrush::traits::{
    AccountId,
    Storage,
};

#[openbrush::implementation(PSP22)]
#[openbrush::contract]
pub mod my_psp22 {
    use crate::*;

    #[ink(storage)]
    #[derive(Storage)]
    pub struct Contract {
        #[storage_field]
        psp22: psp22::Data,
    }

    impl Contract {
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut instance = Self {
                psp22: Default::default(),
            };
            Internal::_mint_to(&mut instance, Self::env().caller(), 1000000000000000u128).expect("Should mint");
            instance
        }
    }
}