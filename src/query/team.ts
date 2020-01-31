import { Response } from './response'
import * as I from '../index'
import * as _ from 'lodash'
export class Team extends Response {
  /**
   * @description Update a team
   * @param userId User ID
   * @param teamId Team ID
   * @param form Form contains: "teamName"
   */
  public async updateTeam (userId: number, teamId: number, form: any): Promise<I.Team> {
    try {
      const team = await this.api('teams').select().where({ id: teamId })
      if (team.length !== 0) {
        if (team[0].managerIdFk === userId) {
          await this.api('teams').where({ id: teamId }).update({
            teamName: form.teamName
          })
          const teams: I.Team[] = await this.api('teams').where({ id: teamId, teamName: form.teamName })
          return teams[0]
        } else {
          throw new Error('Você não tem autorização para atualizar o time')
        }
      } else {
        throw new Error('O time informado não foi encontrado')
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * @description Get all team by User ID
   * @param userId User ID
   */
  public async getAllTeamByUserId (userId: number): Promise<I.Team[]> {
    try {
      const teams: I.Team[] = await this.api('teams').select().where({ managerIdFk: userId })
      return teams
    } catch (error) {
      throw new Error('Erro ao tentar localizar todas as equipes')
    }
  }

  /**
   * @description Delete a team
   * @param userId User ID "owner"
   * @param teamId Team ID
   */
  public async deleteTeam (userId: number, teamId: number): Promise<void> {
    try {
      await this.api('teams').where({ id: teamId, managerIdFk: userId }).del()
    } catch (error) {
      throw new Error('Erro ao tenta remover equipe')
    }
  }

  /**
   * @description Add a member to the team
   * @param userId User ID
   * @param form Form contains: "teamIdFk" and "email"
   */
  public async addMember (userId: number, form: any): Promise<void> {
    try {
      const team: I.Team[] = await this.api('teams').select().where({
        id: form.teamIdFk,
        managerIdFk: userId
      })
      const user: I.User[] = await this.api('users').select().where({ email: form.email })

      const rules: I.TeamRules[] = await this.api('team_rules').select().where({
        teamIdFk: form.teamIdFk,
        userIdFk: user[0].id
      })

      if (_.isNil(team)) {
        throw new Error('O time informado não existe')
      }

      if (_.isNil(user)) {
        throw new Error('O email informado não pertence a nenhum usuário')
      }

      if (user[0].id !== userId) {
        throw new Error('Não é permitido adicionar você mesmo')
      }

      if (!_.isNil(rules)) {
        throw new Error('Esse usuário já está no time')
      }

      await this.api('team_rules').insert({
        teamIdFk: form.teamIdFk,
        userIdFk: user[0].id
      })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * @description Remove a member from team
   * @param rulesId Rules ID
   */
  public async removeMember (rulesId: number): Promise<void> {
    try {
      await this.api('team_rules').where({ id: rulesId }).del()
    } catch (error) {
      throw new Error('Erro ao tentar remover regras da equipe')
    }
  }

  /**
   * @description List all team members
   * @param userId User ID
   * @param teamIdFk Team ID
   */
  public async listAllMembers (userId: number, teamIdFk: number): Promise<any> {
    try {
      const team: I.Team[] = await this.api('teams')
        .where({ id: teamIdFk, managerIdFk: userId }).select()

      if (_.isNil(team)) {
        throw new Error('Esse time não existe')
      } else {
        const listAllMembers = await this.api('team_rules').where({
          teamIdFk: teamIdFk
        }).join('users', 'users.id', 'team_rules.userIdFk').select('users.name', 'team_rules.id')
        return listAllMembers
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
